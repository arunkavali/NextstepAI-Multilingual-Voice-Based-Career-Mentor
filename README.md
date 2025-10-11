# NextStep.AI – Multilingual AI Career Mentor

NextStep.AI is an intelligent career guidance platform powered by OpenAI's GPT, Whisper, and DALL·E APIs. It helps students discover personalized career paths, visualize learning roadmaps, and receive AI-driven mentorship in multiple languages.

## Key Features

- **Personalized career guidance using AI** - Get tailored advice based on your interests, skills, and aspirations
- **Voice-based queries via Whisper API** - Interact naturally using speech recognition and transcription
- **Visual career path generation using DALL·E** - See your career journey visualized with AI-generated roadmaps
- **Multilingual and accessible interface** - Support for multiple languages to reach diverse users
- **Interactive dashboard** - Track conversations, career paths, and learned skills in one place
- **Clickable containers** - Easy access to all career roadmaps and skills from the dashboard
- **Audio playback** - Listen to AI responses with text-to-speech functionality
- **Real-time chat** - Seamless conversations with your AI career mentor

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI APIs**: OpenAI GPT-4o, Whisper, DALL·E 3
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Framer Motion
- **Deployment**: Vercel / Netlify

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nextstep-ai.git
cd nextstep-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Features in Detail

### Dashboard
- **Career Paths Container**: Click to view all generated roadmaps with download options
- **Skills Learned Container**: Click to see categorized skills with proficiency levels
- **Recent Conversations**: Direct links to continue previous chat sessions

### Chat Interface
- Real-time AI responses powered by GPT-4o
- Voice input with Whisper transcription
- Text-to-speech audio playback for responses
- Automatic skill extraction and tracking
- Conversation history persistence

### Career Roadmap Visualization
- AI-generated visual roadmaps using DALL·E 3
- Loading animations and progress indicators
- Automatic audio playback when roadmap is ready
- Download functionality for all roadmaps

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── Layout.tsx   # Main layout wrapper
│   ├── CareerPathsModal.tsx
│   ├── SkillsLearnedModal.tsx
│   └── CareerRoadmapVisualization.tsx
├── pages/           # Page components
│   ├── Dashboard.tsx
│   └── Chat.tsx
├── lib/             # Utility functions
│   ├── supabase.ts  # Supabase client
│   ├── openai.ts    # OpenAI API functions
│   └── utils.ts     # Helper functions
├── types/           # TypeScript types
└── App.tsx          # Main app component
```

## Database Schema

The application uses Supabase with the following tables:

- **conversations**: Stores chat history and messages
- **career_paths**: Generated roadmaps and visualizations
- **skills_learned**: Tracked skills from conversations
- **user_preferences**: User settings and preferences

All tables have Row Level Security (RLS) enabled for data protection.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.

## Author

Built with passion by the NextStep.AI team.
