import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              NextStep.AI
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-blue-50',
                location.pathname === '/' && 'bg-blue-100 text-blue-700'
              )}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              to="/chat"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-blue-50',
                location.pathname.startsWith('/chat') && 'bg-blue-100 text-blue-700'
              )}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Chat</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t bg-white/50 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>NextStep.AI - Your AI Career Mentor</p>
        </div>
      </footer>
    </div>
  );
}
