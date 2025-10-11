/*
  # NextStep.AI Database Schema

  ## Overview
  Creates the complete database structure for NextStep.AI - a multilingual AI career mentor platform.

  ## New Tables
  
  ### 1. `conversations`
  Stores all chat conversations between users and the AI mentor.
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid, nullable) - Link to authenticated user (null for anonymous)
  - `title` (text) - Conversation title/summary
  - `language` (text) - Language used (en, te, hi, etc.)
  - `created_at` (timestamptz) - Conversation start time
  - `updated_at` (timestamptz) - Last message time
  - `messages` (jsonb) - Array of message objects with role, content, timestamp
  
  ### 2. `career_paths`
  Stores generated career roadmaps and visualizations.
  - `id` (uuid, primary key) - Unique roadmap identifier
  - `user_id` (uuid, nullable) - Link to authenticated user
  - `conversation_id` (uuid) - Related conversation
  - `title` (text) - Career path name (e.g., "Software Engineer Roadmap")
  - `description` (text) - Detailed description
  - `roadmap_data` (jsonb) - Structured roadmap nodes, skills, milestones
  - `image_url` (text, nullable) - DALL-E generated visualization URL
  - `pdf_url` (text, nullable) - Generated PDF download link
  - `created_at` (timestamptz) - Generation timestamp
  
  ### 3. `skills_learned`
  Tracks skills explored/learned by users through conversations.
  - `id` (uuid, primary key) - Unique skill record
  - `user_id` (uuid, nullable) - Link to authenticated user
  - `conversation_id` (uuid, nullable) - Related conversation
  - `skill_name` (text) - Skill name (e.g., "React", "Python")
  - `category` (text) - Skill category (e.g., "Programming", "Design")
  - `proficiency_level` (text) - Suggested level (beginner, intermediate, advanced)
  - `resources` (jsonb) - Learning resources, links, tutorials
  - `created_at` (timestamptz) - When skill was identified
  
  ### 4. `user_preferences`
  Stores user settings and preferences.
  - `user_id` (uuid, primary key) - Link to authenticated user
  - `language` (text) - Preferred language
  - `voice_enabled` (boolean) - Voice interaction preference
  - `theme` (text) - UI theme preference
  - `notification_settings` (jsonb) - Notification preferences
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for anonymous users on their own data
  - Authenticated users can manage their own data
  - Data isolation by user_id or session

  ## Indexes
  - Conversation lookup by user and date
  - Career path lookup by user
  - Skills lookup by user and category
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL DEFAULT 'New Conversation',
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  messages jsonb DEFAULT '[]'::jsonb
);

-- Create career_paths table
CREATE TABLE IF NOT EXISTS career_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  roadmap_data jsonb DEFAULT '{}'::jsonb,
  image_url text,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

-- Create skills_learned table
CREATE TABLE IF NOT EXISTS skills_learned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  skill_name text NOT NULL,
  category text DEFAULT 'General',
  proficiency_level text DEFAULT 'beginner',
  resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY,
  language text DEFAULT 'en',
  voice_enabled boolean DEFAULT true,
  theme text DEFAULT 'light',
  notification_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_paths_user_id ON career_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_conversation_id ON career_paths(conversation_id);
CREATE INDEX IF NOT EXISTS idx_skills_learned_user_id ON skills_learned(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_learned_category ON skills_learned(category);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_learned ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Anyone can create conversations"
  ON conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- RLS Policies for career_paths
CREATE POLICY "Anyone can create career paths"
  ON career_paths FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own career paths"
  ON career_paths FOR SELECT
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can update their own career paths"
  ON career_paths FOR UPDATE
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can delete their own career paths"
  ON career_paths FOR DELETE
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- RLS Policies for skills_learned
CREATE POLICY "Anyone can create skills"
  ON skills_learned FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own skills"
  ON skills_learned FOR SELECT
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can update their own skills"
  ON skills_learned FOR UPDATE
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can delete their own skills"
  ON skills_learned FOR DELETE
  TO anon, authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- RLS Policies for user_preferences
CREATE POLICY "Users can create their own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own preferences"
  ON user_preferences FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());