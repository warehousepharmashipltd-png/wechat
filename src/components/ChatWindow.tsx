import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Send, Phone, Video, Info, MoreVertical, Smile } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  type: 'text' | 'image';
}

export default function ChatWindow({ chatId }: { chatId: string }) {
  const { user } = useAuth();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    // Fetch chat details
    const getChat = async () => {
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (chatDoc.exists()) {
        setChat(chatDoc.data());
      }
    };
    getChat();

    // Fetch messages
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messageData);
      
      // Auto scroll
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatId) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: messageText,
        senderId: user.uid,
        timestamp: serverTimestamp(),
        type: 'text'
      });

      // Update chat's last message and updatedAt
      import('firebase/firestore').then(({ setDoc: setDocFirestore }) => {
        setDocFirestore(doc(db, 'chats', chatId), {
          lastMessage: {
            text: messageText,
            senderId: user.uid,
            timestamp: serverTimestamp()
          },
          updatedAt: serverTimestamp()
        }, { merge: true });
      });

    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-4 animate-bounce">
          <Send size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Welcome to VibeChat</h2>
        <p className="text-gray-500 mt-2 text-center max-w-sm">
          Select a conversation from the sidebar or start a new one to begin messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {chat?.name?.[0] || 'C'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{chat?.name || 'Vibe Chat'}</h3>
            <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Active now</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <Video size={20} />
          </button>
           <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <Info size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user?.uid;
          const showAvatar = idx === 0 || messages[idx-1].senderId !== msg.senderId;
          
          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isMe && (
                <div className={`w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-indigo-600 ${!showAvatar && 'opacity-0'}`}>
                  {chat?.name?.[0] || 'U'}
                </div>
              )}
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm border ${
                isMe 
                  ? 'bg-indigo-600 text-white border-indigo-500 rounded-br-none' 
                  : 'bg-white text-gray-800 border-gray-100 rounded-bl-none'
              }`}>
                <p>{msg.text}</p>
                <span className={`text-[9px] block mt-1 ${isMe ? 'text-indigo-200 text-right' : 'text-gray-400'}`}>
                  {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm">No messages yet. Say hi! 👋</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button type="button" className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
            <Smile size={24} />
          </button>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your vibe here..."
            className="flex-1 py-3 px-4 bg-gray-100 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 flex items-center justify-center bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
