import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp,
  addDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, LogOut, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logOut } from '../lib/firebase';

interface Chat {
  id: string;
  participants: string[];
  type: 'direct' | 'group';
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: any;
  };
  updatedAt: any;
  name?: string;
}

export default function Sidebar({ onSelectChat, selectedChatId }: { onSelectChat: (chatId: string) => void, selectedChatId: string | null }) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Chat[];
      setChats(chatData);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="w-80 h-full border-r border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {user?.displayName?.[0] || user?.email?.[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold truncate max-w-[120px]">{user?.displayName}</span>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
        <button 
          onClick={() => logOut()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-red-600"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="flex items-center justify-between px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Recent Conversations</span>
          <button 
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors text-indigo-600"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="space-y-1">
          {chats.map(chat => {
            const lastMsgDate = chat.lastMessage?.timestamp?.toDate();
            const timeStr = lastMsgDate ? lastMsgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedChatId === chat.id 
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-100 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-semibold border border-indigo-200">
                  {chat.name?.[0] || chat.type[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-sm truncate">{chat.name || 'Personal Chat'}</span>
                    <span className="text-[10px] text-gray-400">{timeStr}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
          {chats.length === 0 && (
            <div className="text-center py-10">
              <MessageCircle className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-sm text-gray-400">No chats yet</p>
              <button 
                onClick={() => setIsNewChatModalOpen(true)}
                className="text-xs text-indigo-600 font-medium hover:underline mt-1"
              >
                Start your first one
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
             >
                <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
                  <h3 className="font-bold text-xl">Start New Vibes</h3>
                  <button onClick={() => setIsNewChatModalOpen(false)} className="hover:bg-indigo-700 p-2 rounded-full transition-colors">
                    <LogOut size={20} className="rotate-180" />
                  </button>
                </div>
                <div className="p-8">
                  <NewChatForm onClose={() => setIsNewChatModalOpen(false)} onSelectChat={onSelectChat} />
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewChatForm({ onClose, onSelectChat }: { onClose: () => void, onSelectChat: (chatId: string) => void }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !user) return;
    setSearching(true);
    setError('');

    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const qUser = query(usersRef, where('email', '==', email.toLowerCase().trim()));
      const userDocs = await getDocs(qUser);
      
      if (userDocs.empty) {
        setError("User not found. Invite them to VibeChat!");
        setSearching(false);
        return;
      }

      const targetUser = userDocs.docs[0].data();
      if (targetUser.uid === user.uid) {
        setError("You're already here with yourself! Try someone else.");
        setSearching(false);
        return;
      }

      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const chatQuery = query(
        chatsRef, 
        where('participants', 'array-contains', user.uid)
      );
      
      const chatsSnap = await getDocs(chatQuery);
      let existingChatId = null;
      
      chatsSnap.forEach(doc => {
        const data = doc.data();
        if (data.participants.includes(targetUser.uid) && data.participants.length === 2 && data.type === 'direct') {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        onSelectChat(existingChatId);
        onClose();
      } else {
        const newChat = await addDoc(collection(db, 'chats'), {
          type: 'direct',
          participants: [user.uid, targetUser.uid],
          updatedAt: serverTimestamp(),
          name: targetUser.displayName
        });
        onSelectChat(newChat.id);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to start chat. Check your connection.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Friend's Email</label>
        <input 
          type="email" 
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="hello@vibe.chat"
          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-gray-900"
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs text-rose-500 font-bold bg-rose-50 p-3 rounded-xl border border-rose-100"
        >
          {error}
        </motion.p>
      )}
      <button 
        type="submit" 
        disabled={searching}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
      >
        {searching ? 'Finding vibes...' : 'Start Chatting'}
      </button>
    </form>
  )
}
