import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { sendChatMessage, generateCareerRoadmapImage, textToSpeech, speechToText } from '@/lib/openai';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import type { Conversation, Message } from '@/types';
import CareerRoadmapVisualization from '@/components/CareerRoadmapVisualization';

export default function Chat() {
  const { conversationId } = useParams();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [showRoadmapFor, setShowRoadmapFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return null;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', currentConversationId)
        .maybeSingle();

      if (error) throw error;
      return data as Conversation | null;
    },
    enabled: !!currentConversationId,
  });

  const messages: Message[] = conversation?.messages || [];

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, conversationId: convId }: { message: string; conversationId: string | null }) => {
      const userMessage: Message = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      let finalConvId = convId;

      if (!finalConvId) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            title: message.slice(0, 50),
            messages: [userMessage],
          })
          .select()
          .single();

        if (createError) throw createError;
        finalConvId = newConv.id;
        setCurrentConversationId(finalConvId);
      } else {
        const currentMessages = conversation?.messages || [];
        await supabase
          .from('conversations')
          .update({
            messages: [...currentMessages, userMessage],
            updated_at: new Date().toISOString(),
          })
          .eq('id', finalConvId);
      }

      const chatMessages = [
        {
          role: 'system' as const,
          content: 'You are NextStep.AI, a helpful career mentor. Provide personalized career guidance, suggest learning paths, and help students discover their potential. When discussing career paths, mention specific skills, milestones, and resources.',
        },
        ...(conversation?.messages || []).map(m => ({ role: m.role, content: m.content })),
        userMessage,
      ];

      const aiResponse = await sendChatMessage(chatMessages);

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const { data: updatedConv, error: updateError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', finalConvId)
        .single();

      if (updateError) throw updateError;

      const updatedMessages = [...(updatedConv.messages || []), assistantMessage];

      await supabase
        .from('conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', finalConvId);

      if (aiResponse.toLowerCase().includes('career') || aiResponse.toLowerCase().includes('roadmap') || aiResponse.toLowerCase().includes('path')) {
        const keywords = ['software', 'engineer', 'data scientist', 'designer', 'developer', 'manager'];
        const hasCareerKeyword = keywords.some(keyword => aiResponse.toLowerCase().includes(keyword));

        if (hasCareerKeyword) {
          await extractAndSaveSkills(aiResponse, finalConvId);
        }
      }

      return { conversationId: finalConvId, message: assistantMessage };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      if (isSpeaking) {
        try {
          const audioBlob = await textToSpeech(data.message.content);
          const audioUrl = URL.createObjectURL(audioBlob);

          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
          }
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    },
  });

  const extractAndSaveSkills = async (aiResponse: string, convId: string) => {
    const skillPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    const potentialSkills = aiResponse.match(skillPattern) || [];
    const commonSkills = ['React', 'Python', 'JavaScript', 'TypeScript', 'Machine Learning', 'Data Analysis', 'UI Design', 'SQL', 'AWS', 'Docker'];

    const foundSkills = potentialSkills.filter(skill => commonSkills.includes(skill));

    for (const skill of foundSkills.slice(0, 3)) {
      await supabase.from('skills_learned').insert({
        conversation_id: convId,
        skill_name: skill,
        category: 'Technical',
        proficiency_level: 'beginner',
      });
    }

    queryClient.invalidateQueries({ queryKey: ['skills'] });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessageMutation.mutate({
      message: input,
      conversationId: currentConversationId,
    });

    setInput('');
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          try {
            const transcription = await speechToText(audioBlob);
            setInput(transcription);
            toast.success('Voice transcribed!');
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Failed to transcribe audio');
          }
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        toast.info('Recording... Click again to stop');
      } catch (error) {
        console.error('Microphone error:', error);
        toast.error('Could not access microphone');
      }
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (audioRef.current && !isSpeaking) {
      audioRef.current.pause();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">AI Career Mentor</h2>
                <p className="text-sm text-gray-500">Ask me anything about your career</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSpeaking}
                className={isSpeaking ? 'bg-blue-100' : ''}
              >
                {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h3 className="text-xl font-semibold mb-2">Start Your Career Journey</h3>
                <p className="text-gray-500">
                  Ask me about career paths, skills to learn, or get guidance on your professional development.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              className={isRecording ? 'bg-red-100 border-red-300' : ''}
            >
              {isRecording ? <MicOff className="w-5 h-5 text-red-600" /> : <Mic className="w-5 h-5" />}
            </Button>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about your career path..."
              className="min-h-[60px] resize-none"
            />

            <Button
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="icon"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      <audio ref={audioRef} className="hidden" />

      {showRoadmapFor && (
        <CareerRoadmapVisualization
          conversationId={showRoadmapFor}
          onClose={() => setShowRoadmapFor(null)}
        />
      )}
    </div>
  );
}
