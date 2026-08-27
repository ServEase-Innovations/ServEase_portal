// tabs/MessagesTab.tsx
import React from 'react';
import ChatWindow from '../../Chat/ChatWindow';

interface MessagesTabProps {
  theme: 'light' | 'dark';
  attendance?: any;
}

// Thin wrapper: all the real logic (conversations, sockets, presence,
// typing, sending) lives in <ChatWindow /> + useChat(), so this same
// pattern is reused unchanged in Manager, HR, and SuperAdmin dashboards.
const MessagesTab: React.FC<MessagesTabProps> = ({ theme }) => {
  return <ChatWindow theme={theme} />;
};

export default MessagesTab;
