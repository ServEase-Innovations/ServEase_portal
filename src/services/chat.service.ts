// src/services/chat.service.ts
import api from './api';

export interface ChatParticipant {
  employeeId: string;
  fullName: string;
  emailAddress: string;
  assignedRole: string;
  assignedDepartment: string;
  isActive: boolean;
}

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'Text' | 'Image' | 'File';
  fileUrl: string | null;
  fileName: string | null;
  isDeleted: boolean;
  createdAt: string; // epoch ms, as string
  sender: ChatParticipant;
}

export interface Conversation {
  conversationId: string;
  isGroup: boolean;
  groupName: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  participants: Array<{ employeeId: string; employee: ChatParticipant }>;
}

export interface ConversationSummary {
  conversation: Conversation;
  lastMessage: ChatMessage | null;
  otherParticipants: ChatParticipant[];
  unreadCount: number;
}

export const chatService = {
  // List every conversation the logged-in employee belongs to.
  getConversations: async (): Promise<ConversationSummary[]> => {
    const response = await api.get<ConversationSummary[]>('/messages/conversations');
    return response.data;
  },

  // Start (or resume) a 1:1 chat with any employee, any role.
  startDirectConversation: async (participantId: string): Promise<Conversation> => {
    const response = await api.post<Conversation>('/messages/conversations', { participantId });
    return response.data;
  },

  // Start a group chat.
  startGroupConversation: async (participantIds: string[], groupName: string): Promise<Conversation> => {
    const response = await api.post<Conversation>('/messages/conversations', {
      participantIds,
      groupName,
    });
    return response.data;
  },

  // Paginated message history, oldest -> newest for the returned page.
  getMessages: async (
    conversationId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(
      `/messages/conversations/${conversationId}/messages`,
      { params }
    );
    return response.data;
  },

  // REST fallback for sending; the socket path is preferred for latency
  // but this keeps things working even if the socket briefly drops.
  sendMessage: async (
    conversationId: string,
    data: { content: string; messageType?: 'Text' | 'Image' | 'File'; fileUrl?: string; fileName?: string }
  ): Promise<ChatMessage> => {
    const response = await api.post<ChatMessage>(
      `/messages/conversations/${conversationId}/messages`,
      data
    );
    return response.data;
  },

  markConversationRead: async (conversationId: string): Promise<void> => {
    await api.put(`/messages/conversations/${conversationId}/read`);
  },

  // Reuses the existing /employees/search endpoint (open to every
  // authenticated role) to power the "start a new chat" contact picker.
  searchEmployees: async (q: string): Promise<ChatParticipant[]> => {
    const response = await api.get<{ employees: ChatParticipant[] }>('/employees/search', {
      params: { q },
    });
    return response.data.employees;
  },
};

export default chatService;
