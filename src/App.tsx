import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { signInWithGoogle } from './lib/firebase';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { MessageSquare, Shield, Zap, Heart } from 'lucide-react';
import { motion } from 'motion/react';

function AppContent() {
  const { user } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
            <MessageSquare fill="currentColor" />
            <span>VibeChat</span>
          </div>
          <button 
            onClick={signInWithGoogle}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 active:scale-95"
          >
            Sign In
          </button>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 lg:p-20 gap-12 max-w-7xl mx-auto w-full">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl lg:text-8xl font-black text-gray-900 leading-tight tracking-tighter"
            >
              Connect with <span className="text-indigo-600 underline decoration-indigo-200">your vibes.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-500 max-w-lg leading-relaxed"
            >
              The most elegant real-time messaging experience. Chat with friends, join groups, and express yourself in a beautiful, distraction-free environment.
            </motion.p>
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <button 
                onClick={signInWithGoogle}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
              >
                Get Started Now <Zap size={20} />
              </button>
              <button className="px-8 py-4 bg-white text-gray-600 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
                Learn More
              </button>
            </motion.div>
          </div>

          {/* Feature Grid / Illustration */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full max-w-md">
            <FeatureCard 
              icon={<Shield className="text-indigo-600" />} 
              title="Secure" 
              desc="End-to-end encrypted feel" 
              delay={0.3}
            />
            <FeatureCard 
              icon={<Zap className="text-amber-500" />} 
              title="Fast" 
              desc="Real-time multi-user" 
              delay={0.4}
            />
            <FeatureCard 
              icon={<Heart className="text-rose-500" />} 
              title="Vibe" 
              desc="Clean minimalist UI" 
              delay={0.5}
            />
            <FeatureCard 
              icon={<MessageSquare className="text-emerald-500" />} 
              title="Group" 
              desc="Unlimited group chats" 
              delay={0.6}
            />
          </div>
        </main>

        <footer className="p-8 border-t border-gray-100 text-center text-sm text-gray-400">
          © 2026 VibeChat App. Built with Google AI Studio & Firebase.
        </footer>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden font-sans">
      <Sidebar onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
      <main className="flex-1 h-full shadow-2xl relative z-10">
        <ChatWindow chatId={selectedChatId || ''} />
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </motion.div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
