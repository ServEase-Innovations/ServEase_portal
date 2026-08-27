// src/components/Chat/ChatWindow.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useChat } from '../../hooks/useChat';
import { getChatTheme, getRoleBadgeClasses } from './chatTheme';
import { ChatParticipant } from '../../services/chat.service';

interface ChatWindowProps {
  theme: 'light' | 'dark';
}

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatTime = (epochMs: string) => {
  const date = new Date(Number(epochMs));
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatWindow: React.FC<ChatWindowProps> = ({ theme }) => {
  const {
    myEmployeeId,
    conversations,
    conversationsLoading,
    activeConversationId,
    messages,
    messagesLoading,
    onlineIds,
    typingByConversation,
    openConversation,
    startDirectConversation,
    sendMessage,
    setTyping,
    searchEmployees,
  } = useChat();

  const tc = getChatTheme(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [isMobileChatView, setIsMobileChatView] = useState(false);
  const [newChatResults, setNewChatResults] = useState<ChatParticipant[]>([]);
  const [showNewChatResults, setShowNewChatResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConversationId]);

  // Local, "who am I chatting with" derivation for the header + list, since
  // conversations can be 1:1 or group.
  const displayFor = (c: (typeof conversations)[number]) => {
    if (c.conversation.isGroup) {
      return {
        name: c.conversation.groupName || 'Group chat',
        subtitle: `${c.otherParticipants.length + 1} members`,
        isGroup: true,
        role: null as string | null,
        online: false,
      };
    }
    const other = c.otherParticipants[0];
    return {
      name: other?.fullName || 'Unknown',
      subtitle: other?.assignedRole || '',
      isGroup: false,
      role: other?.assignedRole || null,
      online: other ? onlineIds.has(other.employeeId) : false,
    };
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const d = displayFor(c);
      return d.name.toLowerCase().includes(q) || (d.subtitle || '').toLowerCase().includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, searchQuery, onlineIds]);

  // Debounced "search everyone in the company" for starting a brand new chat.
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchQuery.trim()) {
      setNewChatResults([]);
      setShowNewChatResults(false);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchEmployees(searchQuery);
      setNewChatResults(results.filter((e) => e.employeeId !== myEmployeeId));
      setSearching(false);
      setShowNewChatResults(true);
    }, 350);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const activeConversation = conversations.find(
    (c) => c.conversation.conversationId === activeConversationId
  );
  const activeDisplay = activeConversation ? displayFor(activeConversation) : null;
  const typingNames = activeConversationId
    ? (typingByConversation[activeConversationId] || []).filter((id) => id !== myEmployeeId)
    : [];

  const handleSelectConversation = (id: string) => {
    openConversation(id);
    setIsMobileChatView(true);
  };

  const handleStartNewChat = async (employeeId: string) => {
    setSearchQuery('');
    setShowNewChatResults(false);
    const id = await startDirectConversation(employeeId);
    if (id) setIsMobileChatView(true);
  };

  const handleSend = () => {
    if (!draft.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, draft);
    setDraft('');
    setTyping(activeConversationId, false);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!activeConversationId) return;
    setTyping(activeConversationId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(activeConversationId, false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] sm:h-[calc(100vh-200px)] min-h-[400px] sm:min-h-[500px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 flex-1 min-h-0">
        {/* Contact list / search */}
        <div
          className={`${tc.bgCard} rounded-2xl border ${tc.border} ${tc.shadow} overflow-hidden flex flex-col ${
            isMobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className={`p-3 sm:p-4 border-b ${tc.border}`}>
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats or find anyone to message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-1.5 sm:py-2 ${tc.input} border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {/* "Start a new chat" results — anyone in the company, any role */}
            {showNewChatResults && (
              <div className={`border-b ${tc.border}`}>
                <p className={`px-3 sm:px-4 pt-3 pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide ${tc.textMuted}`}>
                  {searching ? 'Searching…' : `People (${newChatResults.length})`}
                </p>
                {newChatResults.map((emp) => (
                  <div
                    key={emp.employeeId}
                    onClick={() => handleStartNewChat(emp.employeeId)}
                    className={`px-3 sm:px-4 py-2.5 cursor-pointer flex items-center gap-3 ${tc.bgCardHover}`}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleStartNewChat(emp.employeeId)}
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                      {initials(emp.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${tc.text}`}>{emp.fullName}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeClasses(emp.assignedRole, theme)}`}>
                        {emp.assignedRole}
                      </span>
                    </div>
                    <PlusIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  </div>
                ))}
                {!searching && newChatResults.length === 0 && (
                  <p className={`px-4 pb-3 text-xs ${tc.textMuted}`}>No matching employees</p>
                )}
              </div>
            )}

            {conversationsLoading ? (
              <div className={`p-6 text-center text-sm ${tc.textMuted}`}>Loading conversations…</div>
            ) : filteredConversations.length === 0 && !showNewChatResults ? (
              <div className={`p-6 text-center text-sm ${tc.textMuted}`}>
                No conversations yet. Search above for anyone in the company to start chatting.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const d = displayFor(c);
                const isActive = c.conversation.conversationId === activeConversationId;
                return (
                  <div
                    key={c.conversation.conversationId}
                    onClick={() => handleSelectConversation(c.conversation.conversationId)}
                    className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 border-b ${tc.border} ${tc.bgCardHover} ${
                      isActive ? 'bg-indigo-500/10' : ''
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleSelectConversation(c.conversation.conversationId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                          {initials(d.name)}
                        </div>
                        {!d.isGroup && d.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${tc.text} truncate text-sm sm:text-base`}>{d.name}</h4>
                          {c.lastMessage && (
                            <span className={`text-[10px] sm:text-xs ${tc.textMuted} flex-shrink-0 ml-2`}>
                              {formatTime(c.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs sm:text-sm ${tc.textSecondary} truncate`}>
                            {c.lastMessage
                              ? `${c.lastMessage.senderId === myEmployeeId ? 'You: ' : ''}${c.lastMessage.content}`
                              : d.subtitle}
                          </p>
                          {c.unreadCount > 0 && (
                            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-500 text-white text-[8px] sm:text-xs flex items-center justify-center font-medium flex-shrink-0">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Active thread */}
        <div
          className={`md:col-span-2 ${tc.bgCard} rounded-2xl border ${tc.border} ${tc.shadow} overflow-hidden flex flex-col ${
            !isMobileChatView ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeConversationId && activeDisplay ? (
            <>
              <div className={`p-3 sm:p-4 border-b ${tc.border} flex items-center gap-3`}>
                <button
                  onClick={() => setIsMobileChatView(false)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-black/5 text-indigo-400"
                  aria-label="Back to contacts"
                  title="Back to contacts"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                    {initials(activeDisplay.name)}
                  </div>
                  {!activeDisplay.isGroup && activeDisplay.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-medium ${tc.text} text-sm sm:text-base truncate`}>{activeDisplay.name}</h4>
                  <p className={`text-[10px] sm:text-xs ${tc.textMuted} truncate`}>
                    {typingNames.length > 0
                      ? 'typing…'
                      : activeDisplay.isGroup
                      ? activeDisplay.subtitle
                      : activeDisplay.online
                      ? 'Online'
                      : activeDisplay.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin space-y-3">
                {messagesLoading ? (
                  <div className={`text-center text-sm ${tc.textMuted}`}>Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className={`text-center text-sm ${tc.textMuted}`}>
                    No messages yet. Say hello 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === myEmployeeId;
                    return (
                      <div key={msg.messageId} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-2.5 sm:p-3 rounded-xl ${
                            isMine ? tc.messageSent : `${tc.messageReceived} border ${tc.border}`
                          }`}
                        >
                          {!isMine && activeDisplay.isGroup && (
                            <p className={`text-[10px] sm:text-xs font-medium ${tc.textMuted} mb-1`}>
                              {msg.sender.fullName}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[8px] sm:text-xs mt-1 ${isMine ? 'text-white/70' : tc.textMuted}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className={`p-2 sm:p-4 border-t ${tc.border}`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => handleDraftChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className={`flex-1 px-3 sm:px-4 py-1.5 sm:py-2 ${tc.input} border rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent outline-none transition-all text-sm min-w-0`}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!draft.trim()}
                    className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${
                      draft.trim()
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
                <p className={`text-xs sm:text-sm ${tc.textSecondary}`}>
                  Search for anyone in the company to start chatting — any role, any team.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
