import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Camera, Image as ImageIcon, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'agent' | 'system';
  created_at: string;
  attachment_url?: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
}

const SupportChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [agentOnline, setAgentOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initializeChat();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (ticket) {
      setupRealtimeChat();
    }
  }, [ticket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    if (!user) return;

    try {
      // Check for existing open chat ticket
      const { data: existingTickets, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'chat')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let ticketData = existingTickets?.[0];

      if (!ticketData) {
        // Create new chat ticket
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const { data: newTicket, error: createError } = await supabase
          .from('support_tickets')
          .insert({
            user_id: user.id,
            subject: 'Live Chat Support',
            description: 'Customer initiated live chat',
            category: 'chat',
            priority: 'medium',
            customer_name: profile?.full_name || 'Customer',
            customer_email: user.email || '',
            status: 'open'
          })
          .select()
          .single();

        if (createError) throw createError;
        ticketData = newTicket;

        // Add welcome message
        await supabase
          .from('support_chat_messages')
          .insert({
            ticket_id: ticketData.id,
            sender_type: 'system',
            message: 'Welcome to Revonn Support! How can we help you today?'
          });
      }

      setTicket(ticketData);
      await fetchMessages(ticketData.id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeChat = () => {
    if (!ticket) return;

    const channel = supabase
      .channel(`chat-${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `ticket_id=eq.${ticket.id}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          if (newMessage.sender_type === 'agent') {
            setAgentOnline(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !ticket || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: user.id,
          sender_type: 'user',
          message: currentMessage.trim()
        });

      if (error) throw error;

      setCurrentMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/support')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900">Support Chat</h1>
              <p className="text-sm text-gray-500">
                {agentOnline ? (
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Agent online
                  </span>
                ) : (
                  "We'll respond as soon as possible"
                )}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender_type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.sender_type === 'system'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-white text-gray-800 shadow-sm border'
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender_type === 'user'
                    ? 'text-blue-100'
                    : 'text-gray-500'
                }`}
              >
                {formatTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sending}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!currentMessage.trim() || sending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;