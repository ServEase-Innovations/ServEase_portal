// tabs/MessagesTab.tsx
import React, { useState } from 'react';
import { getThemeClasses } from './themeUtils';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  VideoCameraIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface MessagesTabProps {
  theme: 'light' | 'dark';
  attendance: any;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  read: boolean;
}

const MessagesTab: React.FC<MessagesTabProps> = ({ theme, attendance }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileChatView, setIsMobileChatView] = useState(false);
  const tc = getThemeClasses(theme);

  const contacts = [
    { id: '1', name: 'Priya Nair', role: 'Engineering Manager', status: 'online', lastMessage: 'Great work on the OAuth migration!', time: '10:30 AM', unread: 2 },
    { id: '2', name: 'Aarav Mehta', role: 'Super Admin', status: 'online', lastMessage: 'Please review Q3 performance goals', time: 'Yesterday', unread: 1 },
    { id: '3', name: 'Ishita Roy', role: 'Software Engineer', status: 'busy', lastMessage: 'Can you review my PR?', time: 'Yesterday', unread: 0 },
    { id: '4', name: 'Sanya Kapoor', role: 'HR Business Partner', status: 'online', lastMessage: 'Health insurance documents ready', time: '2 days ago', unread: 0 },
    { id: '5', name: 'Amit Patel', role: 'DevOps Engineer', status: 'away', lastMessage: 'Deployment completed successfully', time: '2 days ago', unread: 0 },
    { id: '6', name: 'Neha Gupta', role: 'Product Manager', status: 'online', lastMessage: 'Product roadmap review tomorrow', time: '3 days ago', unread: 0 },
  ];

  const chatMessages: Record<string, ChatMessage[]> = {
    '1': [
      { id: '1', senderId: '1', senderName: 'Priya Nair', content: 'Hey Rohan, great work on the OAuth migration!', timestamp: '10:30 AM', type: 'text', read: true },
      { id: '2', senderId: 'me', senderName: 'You', content: 'Thank you Priya! The team did a great job.', timestamp: '10:32 AM', type: 'text', read: true },
      { id: '3', senderId: '1', senderName: 'Priya Nair', content: 'Please create a PR for review by EOD.', timestamp: '10:33 AM', type: 'text', read: false },
    ],
    '2': [
      { id: '1', senderId: '2', senderName: 'Aarav Mehta', content: 'Please review and confirm your Q3 performance goals by end of this week.', timestamp: 'Yesterday', type: 'text', read: false },
    ],
    '3': [
      { id: '1', senderId: '3', senderName: 'Ishita Roy', content: 'Can you please review my PR for the auth flow changes?', timestamp: 'Yesterday', type: 'text', read: true },
      { id: '2', senderId: 'me', senderName: 'You', content: 'Sure Ishita, I\'ll take a look right away.', timestamp: 'Yesterday', type: 'text', read: true },
    ],
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      read: true,
    };
    
    if (chatMessages[selectedChat]) {
      chatMessages[selectedChat].push(message);
    }
    
    setNewMessage('');
  };

  const getStatusDot = (status: string) => {
    const colors = {
      online: 'bg-emerald-500',
      offline: 'bg-gray-400',
      away: 'bg-amber-500',
      busy: 'bg-rose-500',
    };
    return <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block ${colors[status as keyof typeof colors]}`}></span>;
  };

  const handleSelectChat = (id: string) => {
    setSelectedChat(id);
    setIsMobileChatView(true);
  };

  const handleBackToContacts = () => {
    setIsMobileChatView(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] sm:h-[calc(100vh-200px)] min-h-[400px] sm:min-h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 flex-1 min-h-0">
        <div className={`${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden flex flex-col ${isMobileChatView ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 sm:p-4 border-b ${tc.border}">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleSelectChat(contact.id)}
                className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 border-b ${tc.border} ${tc.bgCardHover} ${
                  selectedChat === contact.id ? 'bg-indigo-500/10 border-indigo-500/30' : ''
                }`}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && handleSelectChat(contact.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusDot(contact.status)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${tc.text} truncate text-sm sm:text-base`}>{contact.name}</h4>
                      <span className={`text-[10px] sm:text-xs ${tc.textMuted} flex-shrink-0 ml-2`}>{contact.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs sm:text-sm ${tc.textSecondary} truncate`}>{contact.lastMessage}</p>
                      {contact.unread > 0 && (
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-500 text-white text-[8px] sm:text-xs flex items-center justify-center font-medium flex-shrink-0 ml-2">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`md:col-span-2 ${tc.bgCard} rounded-2xl ${tc.border} ${tc.shadow} overflow-hidden flex flex-col ${!isMobileChatView ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              <div className={`p-3 sm:p-4 border-b ${tc.border} flex items-center gap-3`}>
                <button
                  onClick={handleBackToContacts}
                  className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-indigo-400"
                  aria-label="Back to contacts"
                  title="Back to contacts"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {contacts.find(c => c.id === selectedChat) && (
                  <>
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                        {contacts.find(c => c.id === selectedChat)?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {getStatusDot(contacts.find(c => c.id === selectedChat)?.status || 'offline')}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium ${tc.text} text-sm sm:text-base truncate`}>
                        {contacts.find(c => c.id === selectedChat)?.name}
                      </h4>
                      <p className={`text-[10px] sm:text-xs ${tc.textMuted} truncate`}>
                        {contacts.find(c => c.id === selectedChat)?.role}
                      </p>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      <button 
                        className="p-1.5 sm:p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                        aria-label={`Call ${contacts.find(c => c.id === selectedChat)?.name}`}
                      >
                        <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        className="p-1.5 sm:p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-colors"
                        aria-label={`Video call ${contacts.find(c => c.id === selectedChat)?.name}`}
                      >
                        <VideoCameraIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin space-y-3">
                {(chatMessages[selectedChat] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-xl ${
                      msg.senderId === 'me' ? tc.messageSent : tc.messageReceived
                    }`}>
                      {msg.senderId !== 'me' && (
                        <p className={`text-[10px] sm:text-xs font-medium ${tc.textMuted} mb-1`}>{msg.senderName}</p>
                      )}
                      <p className="text-xs sm:text-sm break-words">{msg.content}</p>
                      <p className={`text-[8px] sm:text-xs mt-1 ${msg.senderId === 'me' ? 'text-blue-200/70' : tc.textMuted}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-2 sm:p-4 border-t ${tc.border}`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-indigo-500/10 text-indigo-400 transition-colors flex-shrink-0"
                    aria-label="Attach file"
                  >
                    <PaperClipIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 ${tc.input} rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm min-w-0`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${
                      newMessage.trim() 
                        ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                        : 'bg-gray-200/20 text-gray-400 cursor-not-allowed'
                    } transition-colors`}
                    aria-label="Send message"
                  >
                    <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className={`w-12 h-12 sm:w-16 sm:h-16 ${tc.textMuted} mx-auto mb-3 sm:mb-4`} />
                <h3 className={`text-base sm:text-lg font-semibold ${tc.text} mb-1 sm:mb-2`}>No Conversation Selected</h3>
                <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>Select a contact to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesTab;