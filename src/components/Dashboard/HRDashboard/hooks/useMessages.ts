// src/pages/HRDashboard/hooks/useMessages.ts

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Message } from '../types';

export const useMessages = (initialMessages: Message[]) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState({
    receiver: '',
    subject: '',
    content: '',
    category: 'General' as Message['category']
  });
  const [showCompose, setShowCompose] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Message['category'] | 'all'>('all');

  const handleSendMessage = useCallback(() => {
    if (!newMessage.receiver || !newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all fields');
      return;
    }

    const message: Message = {
      id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      sender: 'Sanya Kapoor',
      senderRole: 'HR',
      receiver: newMessage.receiver,
      receiverRole: 'Employee',
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toLocaleString(),
      read: false,
      category: newMessage.category
    };

    setMessages([message, ...messages]);
    setNewMessage({ receiver: '', subject: '', content: '', category: 'General' });
    setShowCompose(false);
    toast.success('Message sent successfully');
  }, [newMessage, messages]);

  const markAsRead = useCallback((id: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, read: true } : msg
      )
    );
  }, []);

  const deleteMessage = useCallback((id: string) => {
    if (confirm('Delete this message?')) {
      setMessages(prev => prev.filter(msg => msg.id !== id));
    }
  }, []);

  const filteredMessages = messages.filter(msg => {
    const readFilter = selectedFilter === 'all' ? true : selectedFilter === 'unread' ? !msg.read : msg.read;
    const categoryFilter = selectedCategory === 'all' || msg.category === selectedCategory;
    return readFilter && categoryFilter;
  });

  return {
    messages,
    newMessage,
    showCompose,
    selectedFilter,
    selectedCategory,
    filteredMessages,
    setNewMessage,
    setShowCompose,
    setSelectedFilter,
    setSelectedCategory,
    handleSendMessage,
    markAsRead,
    deleteMessage,
    setMessages
  };
};