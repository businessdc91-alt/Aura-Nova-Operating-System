'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Image as ImageIcon,
  X,
  ChevronLeft,
  Pin,
  BellOff,
  Trash2,
  Archive,
  Check,
  CheckCheck,
  Edit,
  Reply,
  Clock,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import {
  Conversation,
  DirectMessage,
  getConversations,
  getConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  getTotalUnreadCount,
  pinConversation,
  muteConversation,
  archiveConversation,
  setTyping,
  getTypingUsers,
  editMessage,
  deleteMessage,
  reactToMessage,
  startConversationWithUser,
} from '@/services/directMessageService';
import { SocialUser, getCurrentUser, getAllUsers, getUserById } from '@/services/socialNetworkService';

// ================== TYPES ==================
interface MessengerProps {
  conversationId?: string;
  onClose?: () => void;
  onConversationSelect?: (conversationId: string) => void;
  mode?: 'full' | 'popup' | 'sidebar' | 'compact';
  className?: string;
}

// ================== HELPERS ==================
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const msgDate = new Date(date);
  const diff = now.getTime() - msgDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return msgDate.toLocaleDateString([], { weekday: 'long' });
  return msgDate.toLocaleDateString();
};

const STATUS_COLORS = {
  online: '#22c55e',
  away: '#f59e0b',
  busy: '#ef4444',
  offline: '#6b7280',
};

// ================== EMOJI PICKER (Simple) ==================
const QUICK_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '👏', '🎉'];

function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 left-0 bg-slate-800 rounded-lg shadow-xl border border-slate-700 p-2 flex gap-1">
      {QUICK_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => { onSelect(emoji); onClose(); }}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-lg"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ================== CONVERSATION LIST ITEM ==================
function ConversationItem({ 
  conversation, 
  isSelected, 
  onClick 
}: { 
  conversation: Conversation; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const currentUser = getCurrentUser();
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);

  if (!otherParticipant) return null;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-aura-600/20 border-l-2 border-aura-500' 
          : 'hover:bg-slate-800/50'
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white font-medium">
          {otherParticipant.avatar ? (
            <img src={otherParticipant.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            otherParticipant.displayName[0].toUpperCase()
          )}
        </div>
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900"
          style={{ backgroundColor: STATUS_COLORS[otherParticipant.status] }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-medium text-white truncate">
            {otherParticipant.displayName}
          </span>
          {conversation.lastMessage && (
            <span className="text-xs text-slate-500">
              {formatTime(new Date(conversation.lastMessage.createdAt))}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-400 truncate flex-1">
            {conversation.lastMessage?.content || 'No messages yet'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="bg-aura-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Pin indicator */}
      {conversation.isPinned && (
        <Pin size={14} className="text-amber-400 flex-shrink-0" />
      )}
    </div>
  );
}

// ================== MESSAGE BUBBLE ==================
function MessageBubble({ 
  message, 
  isOwn,
  showAvatar = true,
  onReact,
  onEdit,
  onDelete,
  onReply,
}: { 
  message: DirectMessage; 
  isOwn: boolean;
  showAvatar?: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onEdit: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onReply: (message: DirectMessage) => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  return (
    <div 
      className={`flex gap-2 mb-2 group ${isOwn ? 'flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowEmojis(false); }}
    >
      {/* Avatar */}
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs flex-shrink-0">
          {message.sender?.displayName?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      {/* Message content */}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Reply preview */}
        {message.replyTo && (
          <div className={`text-xs text-slate-500 mb-1 px-3 py-1 rounded bg-slate-800/50 border-l-2 ${isOwn ? 'border-aura-500' : 'border-slate-600'}`}>
            <span className="font-medium">{message.replyTo.sender?.displayName}</span>: {message.replyTo.content.slice(0, 50)}...
          </div>
        )}

        <div className="relative">
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn 
                ? 'bg-aura-600 text-white rounded-br-md' 
                : 'bg-slate-800 text-slate-200 rounded-bl-md'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            
            {/* Time & read receipt */}
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
              <span className="text-[10px] opacity-60">
                {formatTime(new Date(message.createdAt))}
              </span>
              {message.isEdited && (
                <span className="text-[10px] opacity-60">(edited)</span>
              )}
              {isOwn && (
                <span className="opacity-60">
                  {message.readAt ? (
                    <CheckCheck size={12} className="text-blue-400" />
                  ) : (
                    <Check size={12} />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
              {message.reactions.map((reaction, i) => (
                <span key={i} className="text-sm bg-slate-800 rounded-full px-2 py-0.5">
                  {reaction.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} flex items-center gap-1`}>
              <div className="relative">
                <button
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="p-1.5 rounded hover:bg-slate-700 text-slate-400"
                >
                  <Smile size={14} />
                </button>
                {showEmojis && (
                  <EmojiPicker 
                    onSelect={(emoji) => onReact(message.id, emoji)}
                    onClose={() => setShowEmojis(false)}
                  />
                )}
              </div>
              <button
                onClick={() => onReply(message)}
                className="p-1.5 rounded hover:bg-slate-700 text-slate-400"
              >
                <Reply size={14} />
              </button>
              {isOwn && (
                <>
                  <button
                    onClick={() => onEdit(message.id)}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-400"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(message.id)}
                    className="p-1.5 rounded hover:bg-slate-700 text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================== MAIN MESSENGER COMPONENT ==================
export function Messenger({
  conversationId: initialConversationId,
  onClose,
  onConversationSelect,
  mode = 'full',
  className = '',
}: MessengerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState<DirectMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [typingUsers, setTypingUsers] = useState<SocialUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentUser = getCurrentUser();

  // Load conversations
  useEffect(() => {
    const convos = getConversations();
    setConversations(convos);

    // Select initial conversation
    if (initialConversationId) {
      const convo = getConversation(initialConversationId);
      if (convo) {
        setSelectedConversation(convo);
      }
    }
  }, [initialConversationId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      const msgs = getMessages(selectedConversation.id);
      setMessages(msgs);
      markConversationRead(selectedConversation.id);

      // Update conversations list
      setConversations(getConversations());
    }
  }, [selectedConversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing indicator check
  useEffect(() => {
    if (!selectedConversation) return;

    const interval = setInterval(() => {
      const typing = getTypingUsers(selectedConversation.id);
      setTypingUsers(typing);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedConversation?.id]);

  const handleSelectConversation = (convo: Conversation) => {
    setSelectedConversation(convo);
    setMessages(getMessages(convo.id));
    markConversationRead(convo.id);
    setConversations(getConversations());
    setReplyTo(null);
    setEditingMessageId(null);
    onConversationSelect?.(convo.id);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    if (editingMessageId) {
      // Edit existing message
      editMessage(selectedConversation.id, editingMessageId, messageInput);
      setEditingMessageId(null);
    } else {
      // Send new message
      sendMessage(selectedConversation.id, messageInput, {
        replyToId: replyTo?.id,
      });
    }

    setMessageInput('');
    setReplyTo(null);
    setMessages(getMessages(selectedConversation.id));
    setConversations(getConversations());
  };

  const handleTyping = () => {
    if (!selectedConversation) return;

    setTyping(selectedConversation.id, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing to false after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(selectedConversation.id, false);
    }, 3000);
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (!selectedConversation) return;
    reactToMessage(selectedConversation.id, messageId, emoji);
    setMessages(getMessages(selectedConversation.id));
  };

  const handleEdit = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setMessageInput(message.content);
      setEditingMessageId(messageId);
      inputRef.current?.focus();
    }
  };

  const handleDelete = (messageId: string) => {
    if (!selectedConversation) return;
    if (confirm('Delete this message?')) {
      deleteMessage(selectedConversation.id, messageId);
      setMessages(getMessages(selectedConversation.id));
      toast.success('Message deleted');
    }
  };

  const handleReply = (message: DirectMessage) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const handleStartNewConversation = (user: SocialUser) => {
    try {
      const convo = startConversationWithUser(user.id);
      setConversations(getConversations());
      handleSelectConversation(convo);
      setShowNewConversation(false);
    } catch (error) {
      toast.error('Could not start conversation');
    }
  };

  const handlePinConversation = () => {
    if (!selectedConversation) return;
    pinConversation(selectedConversation.id, !selectedConversation.isPinned);
    setConversations(getConversations());
    setSelectedConversation(getConversation(selectedConversation.id) || null);
    toast.success(selectedConversation.isPinned ? 'Unpinned' : 'Pinned');
    setShowConversationMenu(false);
  };

  const handleMuteConversation = () => {
    if (!selectedConversation) return;
    muteConversation(selectedConversation.id, !selectedConversation.isMuted);
    setConversations(getConversations());
    setSelectedConversation(getConversation(selectedConversation.id) || null);
    toast.success(selectedConversation.isMuted ? 'Unmuted' : 'Muted');
    setShowConversationMenu(false);
  };

  const handleArchiveConversation = () => {
    if (!selectedConversation) return;
    archiveConversation(selectedConversation.id, true);
    setConversations(getConversations());
    setSelectedConversation(null);
    setMessages([]);
    toast.success('Conversation archived');
    setShowConversationMenu(false);
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(c => {
    const otherParticipant = c.participants.find(p => p.id !== currentUser?.id);
    return otherParticipant?.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get other participant for selected conversation
  const otherParticipant = selectedConversation?.participants.find(p => p.id !== currentUser?.id);

  // Get available users for new conversation
  const availableUsers = getAllUsers().filter(u => 
    u.id !== currentUser?.id && 
    !conversations.some(c => c.participantIds.includes(u.id))
  );

  // Group messages by date
  const groupedMessages: { date: string; messages: DirectMessage[] }[] = [];
  let currentDate = '';
  messages.forEach(msg => {
    const dateStr = formatDate(new Date(msg.createdAt));
    if (dateStr !== currentDate) {
      currentDate = dateStr;
      groupedMessages.push({ date: dateStr, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  const containerClasses = {
    full: 'h-screen',
    popup: 'h-[500px] w-[700px] rounded-lg shadow-2xl',
    sidebar: 'h-full',
  };

  return (
    <div className={`flex bg-slate-950 ${containerClasses[mode]} ${className}`}>
      {/* Conversations list */}
      <div className={`${selectedConversation && mode === 'popup' ? 'hidden md:flex' : 'flex'} flex-col w-80 border-r border-slate-800`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare size={20} className="text-aura-400" />
              Messages
            </h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={() => setShowNewConversation(true)}
              >
                <Edit size={16} />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  onClick={onClose}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 bg-slate-800 border-slate-700"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {showNewConversation ? (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewConversation(false)}
                  className="h-8 w-8 text-slate-400"
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="font-medium text-white">New Conversation</span>
              </div>
              {availableUsers.length > 0 ? (
                <div className="space-y-2">
                  {availableUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleStartNewConversation(user)}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-slate-800"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white">
                        {user.displayName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.displayName}</div>
                        <div className="text-xs text-slate-400">@{user.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">
                  You've messaged everyone! 🎉
                </p>
              )}
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(convo => (
              <ConversationItem
                key={convo.id}
                conversation={convo}
                isSelected={selectedConversation?.id === convo.id}
                onClick={() => handleSelectConversation(convo)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-aura-400"
                onClick={() => setShowNewConversation(true)}
              >
                Start a conversation
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mode === 'popup' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 md:hidden"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ChevronLeft size={18} />
                </Button>
              )}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white">
                  {otherParticipant?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <div 
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950"
                  style={{ backgroundColor: STATUS_COLORS[otherParticipant?.status || 'offline'] }}
                />
              </div>
              <div>
                <div className="font-medium text-white">{otherParticipant?.displayName}</div>
                <div className="text-xs text-slate-400">
                  {otherParticipant?.status === 'online' ? 'Online' : 
                   otherParticipant?.status === 'away' ? 'Away' :
                   otherParticipant?.status === 'busy' ? 'Busy' : 'Offline'}
                  {otherParticipant?.currentActivity && ` • ${otherParticipant.currentActivity}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                <Phone size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                <Video size={16} />
              </Button>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  onClick={() => setShowConversationMenu(!showConversationMenu)}
                >
                  <MoreVertical size={16} />
                </Button>
                
                {showConversationMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-10">
                    <button
                      onClick={handlePinConversation}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Pin size={14} /> {selectedConversation.isPinned ? 'Unpin' : 'Pin'} conversation
                    </button>
                    <button
                      onClick={handleMuteConversation}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <BellOff size={14} /> {selectedConversation.isMuted ? 'Unmute' : 'Mute'} notifications
                    </button>
                    <button
                      onClick={handleArchiveConversation}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Archive size={14} /> Archive conversation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {groupedMessages.map((group, gi) => (
              <div key={gi}>
                {/* Date separator */}
                <div className="flex items-center gap-4 my-4">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span className="text-xs text-slate-500">{group.date}</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>

                {/* Messages */}
                {group.messages.map((msg, mi) => {
                  const isOwn = msg.senderId === currentUser?.id;
                  const prevMsg = mi > 0 ? group.messages[mi - 1] : null;
                  const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      onReact={handleReact}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReply={handleReply}
                    />
                  );
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-400 py-2">
                <div className="flex gap-1">
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                </div>
                {typingUsers[0]?.displayName} is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-slate-800">
            {/* Reply preview */}
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-slate-800/50 rounded-lg">
                <Reply size={14} className="text-slate-400" />
                <div className="flex-1 text-sm">
                  <span className="text-aura-400">Replying to {replyTo.sender?.displayName}</span>
                  <p className="text-slate-400 truncate">{replyTo.content}</p>
                </div>
                <button onClick={() => setReplyTo(null)} className="text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Edit indicator */}
            {editingMessageId && (
              <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-amber-500/10 rounded-lg">
                <Edit size={14} className="text-amber-400" />
                <span className="text-sm text-amber-400">Editing message</span>
                <button 
                  onClick={() => { setEditingMessageId(null); setMessageInput(''); }} 
                  className="text-amber-400 hover:text-white ml-auto"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white">
                <Paperclip size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white">
                <ImageIcon size={18} />
              </Button>
              
              <Textarea
                ref={inputRef}
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 border-slate-700 min-h-[40px] max-h-32 resize-none"
                rows={1}
              />

              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white">
                <Smile size={18} />
              </Button>

              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="h-10 w-10 bg-aura-600 hover:bg-aura-700"
                size="icon"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <MessageSquare size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">Select a conversation</h3>
            <p className="text-slate-400 text-sm mb-4">
              Choose from your existing conversations or start a new one
            </p>
            <Button
              onClick={() => setShowNewConversation(true)}
              className="bg-aura-600 hover:bg-aura-700"
            >
              <Edit size={16} className="mr-2" />
              New Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================== FLOATING MESSAGE BUTTON ==================
export function FloatingMessageButton({ onClick }: { onClick?: () => void } = {}) {
  const unreadCount = getTotalUnreadCount();
  const [showMessenger, setShowMessenger] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setShowMessenger(!showMessenger);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="h-14 w-14 rounded-full bg-aura-600 hover:bg-aura-700 shadow-lg"
        size="icon"
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      
      {/* Floating Messenger Panel */}
      {showMessenger && !onClick && (
        <div className="fixed bottom-24 right-4 w-[400px] h-[500px] z-50 shadow-2xl rounded-xl overflow-hidden border border-slate-700">
          <Messenger 
            mode="compact" 
            onClose={() => setShowMessenger(false)} 
          />
        </div>
      )}
    </>
  );
}
