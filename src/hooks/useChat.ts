// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import chatService, {
  ChatMessage,
  ChatParticipant,
  ConversationSummary,
} from '../services/chat.service';

export const useChat = () => {
  const { user, isAuthenticated } = useAuth();
  const myEmployeeId = user?.id ? String(user.id) : null;

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [typingByConversation, setTypingByConversation] = useState<Record<string, string[]>>({});

  const joinedRooms = useRef<Set<string>>(new Set());

  // Keep a ref of the active conversation so socket callbacks (registered
  // once) always see the latest value without re-subscribing.
  const activeConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // --- Load the conversation list ------------------------------------------
  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setConversationsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // --- Connect the socket once we know who's logged in --------------------
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return;
    }
    const socket = connectSocket();

    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => {
        const existing = prev[message.conversationId] || [];
        if (existing.some((m) => m.messageId === message.messageId)) return prev;
        return { ...prev, [message.conversationId]: [...existing, message] };
      });

      // Bump that conversation to the top / update its preview + unread badge.
      setConversations((prev) => {
        const isMine = message.senderId === myEmployeeId;
        const isOpen = message.conversationId === activeConversationIdRef.current;
        const next = prev.map((c) =>
          c.conversation.conversationId === message.conversationId
            ? {
                ...c,
                lastMessage: message,
                unreadCount: isMine || isOpen ? c.unreadCount : c.unreadCount + 1,
              }
            : c
        );
        next.sort(
          (a, b) => Number(b.lastMessage?.createdAt ?? 0) - Number(a.lastMessage?.createdAt ?? 0)
        );
        return next;
      });
    };

    const handleConversationUpdated = () => {
      // Cheapest correct thing to do: re-pull the conversation list so
      // brand-new conversations (started by someone else) show up too.
      refreshConversations();
    };

    const handlePresence = ({ employeeId, status }: { employeeId: string; status: string }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (status === 'online') next.add(employeeId);
        else next.delete(employeeId);
        return next;
      });
    };

    const handleTyping = ({
      conversationId,
      employeeId,
      isTyping,
    }: {
      conversationId: string;
      employeeId: string;
      isTyping: boolean;
    }) => {
      setTypingByConversation((prev) => {
        const current = new Set(prev[conversationId] || []);
        if (isTyping) current.add(employeeId);
        else current.delete(employeeId);
        return { ...prev, [conversationId]: Array.from(current) };
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:updated', handleConversationUpdated);
    socket.on('presence:update', handlePresence);
    socket.on('typing:update', handleTyping);
    socket.on('connect_error', () => {
      // Non-fatal: REST calls still work, just no realtime push.
      console.warn('Chat socket failed to connect');
    });

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:updated', handleConversationUpdated);
      socket.off('presence:update', handlePresence);
      socket.off('typing:update', handleTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, myEmployeeId, refreshConversations]);

  // --- Open a conversation: join its socket room + load history -----------
  const openConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);

      const socket = getSocket();
      if (!joinedRooms.current.has(conversationId)) {
        socket.emit('conversation:join', conversationId);
        joinedRooms.current.add(conversationId);
      }

      if (!messages[conversationId]) {
        setMessagesLoading(true);
        try {
          const history = await chatService.getMessages(conversationId, { limit: 50 });
          setMessages((prev) => ({ ...prev, [conversationId]: history }));
        } catch (err) {
          console.error('Failed to load messages', err);
          toast.error('Could not load this conversation');
        } finally {
          setMessagesLoading(false);
        }
      }

      // Mark read, both for the backend record and to clear the local badge.
      socket.emit('message:read', conversationId);
      chatService.markConversationRead(conversationId).catch(() => {});
      setConversations((prev) =>
        prev.map((c) =>
          c.conversation.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages]
  );

  // --- Start a brand new 1:1 chat, then open it ----------------------------
  const startDirectConversation = useCallback(
    async (participantId: string) => {
      try {
        const conversation = await chatService.startDirectConversation(participantId);
        await refreshConversations();
        await openConversation(conversation.conversationId);
        return conversation.conversationId;
      } catch (err) {
        toast.error('Could not start conversation');
        throw err;
      }
    },
    [refreshConversations, openConversation]
  );

  const startGroupConversation = useCallback(
    async (participantIds: string[], groupName: string) => {
      try {
        const conversation = await chatService.startGroupConversation(participantIds, groupName);
        await refreshConversations();
        await openConversation(conversation.conversationId);
        return conversation.conversationId;
      } catch (err) {
        toast.error('Could not create group');
        throw err;
      }
    },
    [refreshConversations, openConversation]
  );

  // --- Send a message (over the socket; falls back to REST) ---------------
  const sendMessage = useCallback((conversationId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const socket = getSocket();
    if (socket.connected) {
      socket.emit(
        'message:send',
        { conversationId, content: trimmed },
        (ack: { success: boolean; message?: ChatMessage }) => {
          if (!ack?.success) {
            chatService
              .sendMessage(conversationId, { content: trimmed })
              .catch(() => toast.error('Message failed to send'));
          }
        }
      );
    } else {
      chatService
        .sendMessage(conversationId, { content: trimmed })
        .then((message) => {
          setMessages((prev) => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), message],
          }));
        })
        .catch(() => toast.error('Message failed to send'));
    }
  }, []);

  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    const socket = getSocket();
    socket.emit(isTyping ? 'typing:start' : 'typing:stop', conversationId);
  }, []);

  const searchEmployees = useCallback(async (q: string): Promise<ChatParticipant[]> => {
    if (!q.trim()) return [];
    try {
      return await chatService.searchEmployees(q);
    } catch (err) {
      console.error('Employee search failed', err);
      return [];
    }
  }, []);

  return {
    myEmployeeId,
    conversations,
    conversationsLoading,
    activeConversationId,
    messages: activeConversationId ? messages[activeConversationId] || [] : [],
    messagesLoading,
    onlineIds,
    typingByConversation,
    openConversation,
    startDirectConversation,
    startGroupConversation,
    sendMessage,
    setTyping,
    searchEmployees,
    refreshConversations,
  };
};

export default useChat;
