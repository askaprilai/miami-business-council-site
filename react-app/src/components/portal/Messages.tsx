'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Member, Message } from '@/lib/supabase';
import styles from './Messages.module.css';

interface Conversation {
  member: Member;
  lastMessage: Message;
  unreadCount: number;
}

export default function Messages() {
  const { member: currentMember } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Member | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentMember) {
      fetchConversations();
    }
  }, [currentMember]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markMessagesAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!currentMember) return;

    try {
      // Get all messages involving current member
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentMember.id},recipient_id.eq.${currentMember.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, Message[]>();
      allMessages?.forEach(msg => {
        const partnerId = msg.sender_id === currentMember.id ? msg.recipient_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, []);
        }
        conversationMap.get(partnerId)!.push(msg);
      });

      // Fetch member details for each conversation
      const partnerIds = Array.from(conversationMap.keys());
      if (partnerIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: members } = await supabase
        .from('members')
        .select('*')
        .in('id', partnerIds);

      const convos: Conversation[] = [];
      members?.forEach(member => {
        const memberMessages = conversationMap.get(member.id) || [];
        const unreadCount = memberMessages.filter(
          m => m.recipient_id === currentMember.id && !m.is_read
        ).length;

        convos.push({
          member,
          lastMessage: memberMessages[0],
          unreadCount,
        });
      });

      // Sort by most recent message
      convos.sort((a, b) =>
        new Date(b.lastMessage.created_at).getTime() -
        new Date(a.lastMessage.created_at).getTime()
      );

      setConversations(convos);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!currentMember) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentMember.id},recipient_id.eq.${partnerId}),` +
          `and(sender_id.eq.${partnerId},recipient_id.eq.${currentMember.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (partnerId: string) => {
    if (!currentMember) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', partnerId)
      .eq('recipient_id', currentMember.id);

    // Update local state
    setConversations(prev =>
      prev.map(c =>
        c.member.id === partnerId ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember || !selectedConversation || !newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentMember.id,
          recipient_id: selectedConversation.id,
          content: newMessage.trim(),
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessage('');

      // Update conversation list
      setConversations(prev => {
        const updated = prev.map(c =>
          c.member.id === selectedConversation.id
            ? { ...c, lastMessage: data }
            : c
        );
        updated.sort((a, b) =>
          new Date(b.lastMessage.created_at).getTime() -
          new Date(a.lastMessage.created_at).getTime()
        );
        return updated;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className={styles.messages}>
      <div className={styles.header}>
        <h1 className={styles.title}>Messages</h1>
      </div>

      <div className={styles.messagesContainer}>
        {/* Conversations List */}
        <div className={styles.conversationsList}>
          {conversations.length === 0 ? (
            <div className={styles.emptyConversations}>
              <p>No conversations yet</p>
              <span>Connect with members to start messaging</span>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.member.id}
                className={`${styles.conversationItem} ${
                  selectedConversation?.id === conv.member.id ? styles.active : ''
                }`}
                onClick={() => setSelectedConversation(conv.member)}
              >
                <div className={styles.convAvatar}>
                  {conv.member.profile_photo_url ? (
                    <img src={conv.member.profile_photo_url} alt={conv.member.first_name} />
                  ) : (
                    <span>{conv.member.first_name?.[0]}{conv.member.last_name?.[0]}</span>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                  )}
                </div>
                <div className={styles.convInfo}>
                  <div className={styles.convHeader}>
                    <span className={styles.convName}>
                      {conv.member.first_name} {conv.member.last_name}
                    </span>
                    <span className={styles.convTime}>
                      {formatTime(conv.lastMessage.created_at)}
                    </span>
                  </div>
                  <p className={styles.convPreview}>
                    {conv.lastMessage.sender_id === currentMember?.id && 'You: '}
                    {conv.lastMessage.content.substring(0, 40)}
                    {conv.lastMessage.content.length > 40 && '...'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message Thread */}
        <div className={styles.messageThread}>
          {selectedConversation ? (
            <>
              <div className={styles.threadHeader}>
                <div className={styles.threadAvatar}>
                  {selectedConversation.profile_photo_url ? (
                    <img src={selectedConversation.profile_photo_url} alt={selectedConversation.first_name} />
                  ) : (
                    <span>
                      {selectedConversation.first_name?.[0]}
                      {selectedConversation.last_name?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h3>{selectedConversation.first_name} {selectedConversation.last_name}</h3>
                  <p>{selectedConversation.job_title}</p>
                </div>
              </div>

              <div className={styles.messagesList}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.message} ${
                      msg.sender_id === currentMember?.id ? styles.sent : styles.received
                    }`}
                  >
                    <div className={styles.messageBubble}>
                      <p>{msg.content}</p>
                      <span className={styles.messageTime}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className={styles.messageInput}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" disabled={!newMessage.trim()}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className={styles.noConversation}>
              <span className={styles.noConvIcon}>💬</span>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
