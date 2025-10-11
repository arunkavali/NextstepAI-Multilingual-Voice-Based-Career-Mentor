import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { generateCareerRoadmapImage, textToSpeech } from '@/lib/openai';
import { Loader2, Download, X, Volume2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CareerRoadmapVisualizationProps {
  conversationId: string;
  onClose: () => void;
}

export default function CareerRoadmapVisualization({
  conversationId,
  onClose,
}: CareerRoadmapVisualizationProps) {
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const generateRoadmapMutation = useMutation({
    mutationFn: async () => {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conversation) throw new Error('Conversation not found');

      const messages = conversation.messages || [];
      const lastMessages = messages.slice(-5);
      const conversationText = lastMessages
        .map((m: any) => m.content)
        .join(' ')
        .slice(0, 500);

      const imageUrl = await generateCareerRoadmapImage(conversationText);

      const { data: careerPath, error } = await supabase
        .from('career_paths')
        .insert({
          conversation_id: conversationId,
          title: 'Career Roadmap',
          description: 'AI-generated career path visualization',
          image_url: imageUrl,
          roadmap_data: {},
        })
        .select()
        .single();

      if (error) throw error;

      return { imageUrl, careerPath };
    },
    onSuccess: async ({ imageUrl, careerPath }) => {
      setImageUrl(imageUrl);
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['career_paths'] });
      toast.success('Career roadmap generated!');

      try {
        const audioBlob = await textToSpeech(
          'Your personalized career roadmap has been generated. Take a look at the visualization to see your learning path and key milestones.'
        );
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const audio = new Audio(url);
        audio.play();
        setIsPlayingAudio(true);

        audio.onended = () => {
          setIsPlayingAudio(false);
        };
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    },
    onError: (error) => {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate roadmap');
      setIsGenerating(false);
    },
  });

  useEffect(() => {
    generateRoadmapMutation.mutate();
  }, []);

  const handleDownload = () => {
    if (imageUrl) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = 'career-roadmap.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Roadmap downloaded!');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Career Roadmap Visualization</DialogTitle>
            <div className="flex items-center gap-2">
              {imageUrl && (
                <>
                  <Button variant="outline" size="icon" onClick={handleDownload}>
                    <Download className="w-5 h-5" />
                  </Button>
                  {audioUrl && isPlayingAudio && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      <span>Playing audio...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="mt-6 text-lg font-semibold text-gray-700">Generating Your Career Roadmap...</p>
              <p className="mt-2 text-sm text-gray-500">
                Creating a personalized visualization using AI
              </p>
              <div className="mt-6 space-y-2 text-center">
                <p className="text-xs text-gray-400 animate-pulse">Analyzing your conversation...</p>
                <p className="text-xs text-gray-400 animate-pulse delay-100">
                  Identifying key skills and milestones...
                </p>
                <p className="text-xs text-gray-400 animate-pulse delay-200">
                  Creating visual roadmap...
                </p>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
                <img
                  src={imageUrl}
                  alt="Career Roadmap"
                  className="w-full h-auto animate-in fade-in duration-500"
                  loading="eager"
                />
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">About This Roadmap</h3>
                <p className="text-sm text-blue-700">
                  This AI-generated visualization maps out your personalized career journey based on our
                  conversation. Follow the path, develop the highlighted skills, and achieve your career
                  goals!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Failed to generate roadmap. Please try again.</p>
              <Button onClick={() => generateRoadmapMutation.mutate()} className="mt-4">
                Retry
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
