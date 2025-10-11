import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { BookOpen, MessageSquare, Target, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import CareerPathsModal from '@/components/CareerPathsModal';
import SkillsLearnedModal from '@/components/SkillsLearnedModal';
import type { Conversation, CareerPath, Skill } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCareerPaths, setShowCareerPaths] = useState(false);
  const [showSkills, setShowSkills] = useState(false);

  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as Conversation[];
    },
  });

  const { data: careerPaths = [], isLoading: loadingCareerPaths } = useQuery({
    queryKey: ['career_paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('career_paths')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as CareerPath[];
    },
  });

  const { data: skills = [], isLoading: loadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills_learned')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Skill[];
    },
  });

  const handleConversationClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
        <p className="text-gray-600 text-lg">Continue your career journey with AI guidance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="cursor-pointer transition-all hover:shadow-xl hover:scale-105 hover:border-blue-400 group"
          onClick={() => setShowCareerPaths(true)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Target className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
            <CardTitle className="text-2xl">Career Paths</CardTitle>
            <CardDescription>Explore your generated roadmaps</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCareerPaths ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-blue-600">{careerPaths.length}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">Click to view all roadmaps</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:shadow-xl hover:scale-105 hover:border-indigo-400 group"
          onClick={() => setShowSkills(true)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <TrendingUp className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>
            <CardTitle className="text-2xl">Skills Learned</CardTitle>
            <CardDescription>Track your progress</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSkills ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-indigo-600">{skills.length}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">Click to view all skills</p>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-xl hover:scale-105 hover:border-green-400">
          <CardHeader>
            <div className="flex items-center justify-between">
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Conversations</CardTitle>
            <CardDescription>Your chat history</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingConversations ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <p className="text-3xl font-bold text-green-600">{conversations.length}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">Total conversations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Recent Conversations
          </CardTitle>
          <CardDescription>Continue where you left off</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No conversations yet. Start chatting with your AI mentor!</p>
              <Button onClick={() => navigate('/chat')}>Start New Chat</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleConversationClick(conv.id)}
                  className="p-4 rounded-lg border bg-white hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {conv.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(conv.updated_at)}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => navigate('/chat')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <MessageSquare className="w-6 h-6 mr-2" />
          Start New Conversation
        </Button>
      </div>

      <CareerPathsModal
        open={showCareerPaths}
        onOpenChange={setShowCareerPaths}
        careerPaths={careerPaths}
      />

      <SkillsLearnedModal
        open={showSkills}
        onOpenChange={setShowSkills}
        skills={skills}
      />
    </div>
  );
}
