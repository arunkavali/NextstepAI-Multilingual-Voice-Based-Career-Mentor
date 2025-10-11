export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  audio_url?: string;
}

export interface Conversation {
  id: string;
  user_id: string | null;
  title: string;
  language: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface CareerPath {
  id: string;
  user_id: string | null;
  conversation_id: string | null;
  title: string;
  description: string;
  roadmap_data: {
    milestones?: Array<{
      title: string;
      duration: string;
      skills: string[];
    }>;
  };
  image_url: string | null;
  pdf_url: string | null;
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string | null;
  conversation_id: string | null;
  skill_name: string;
  category: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced';
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  created_at: string;
}
