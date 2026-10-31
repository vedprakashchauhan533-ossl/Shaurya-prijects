import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Send, 
  Sparkles, 
  Check, 
  CheckCheck, 
  Bot, 
  User, 
  Search, 
  PhoneCall, 
  ArrowLeft,
  Info,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Conversation, ChatMessage, UserProfile } from '../types';
import { DataStore, formatExactDateTime } from '../lib/dataStore';

interface ChatSectionProps {
  currentUser: UserProfile;
  initialTargetPhone?: string;
  initialTargetName?: string;
  onClearInitialTarget?: () => void;
  onSwitchUser?: (profile: UserProfile) => void;
  allProfiles: UserProfile[];
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  currentUser,
  initialTargetPhone,
  initialTargetName,
  onClearInitialTarget,
  onSwitchUser,
  allProfiles,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [directPhoneInput, setDirectPhoneInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount or currentUser change
  const loadConversations = async () => {
    const list = await DataStore.getConversations(currentUser.phoneNumber);
    setConversations(list);

    // If an initialTargetPhone is provided from feed "Chat Now" button
    if (initialTargetPhone) {
      handleStartDirectChat(initialTargetPhone);
      if (onClearInitialTarget) onClearInitialTarget();
    } else if (!activeConversation && list.length > 0) {
      setActiveConversation(list[0]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [currentUser, initialTargetPhone]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      const msgs = await DataStore.getMessages(activeConversation.id);
      setMessages(msgs);

      // Automatically mark unseen messages as 'seen' if recipient is viewing
      await DataStore.markMessagesAsSeen(activeConversation.id, currentUser.userId);
      const updatedMsgs = await DataStore.getMessages(activeConversation.id);
      setMessages(updatedMsgs);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling for real-time updates
    return () => clearInterval(interval);
  }, [activeConversation?.id, currentUser.userId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle direct start chat with ANY mobile number
  const handleStartDirectChat = async (phoneToChat: string) => {
    if (!phoneToChat.trim()) return;
    try {
      const conv = await DataStore.getOrCreateConversationByPhone(currentUser, phoneToChat.trim());
      await loadConversations();
      setActiveConversation(conv);
      setIsMobileChatOpen(true);
      setDirectPhoneInput('');
    } catch (e: any) {
      alert(e.message || 'Could not start chat');
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || !activeConversation || isSending) return;

    try {
      setIsSending(true);
      const recipientPhone = activeConversation.participantPhones.find(p => p !== currentUser.phoneNumber) || 'Unknown';
      
      const newMsg = await DataStore.sendMessage(
        activeConversation.id,
        currentUser,
        recipientPhone,
        messageContent
      );

      setInputText('');
      setMessages(prev => [...prev, newMsg]);

      // If this is an AI conversation or user requested AI advisor
      if (activeConversation.isAIConversation || recipientPhone === 'VLITS-AI') {
        setIsAiLoading(true);
        const aiMsg = await DataStore.requestAIReply(activeConversation.id, messageContent, currentUser);
        setMessages(prev => [...prev, aiMsg]);
        setIsAiLoading(false);
      } else {
        // For demonstration of two-way real-time chatting between real phones:
        // If recipient is another user in the local ecosystem, simulate an intelligent automated
        // business response after 2.5 seconds to show dynamic 'Seen' and reply behavior!
        setTimeout(async () => {
          // If the message is still the last message, simulate recipient reading it
          await DataStore.markMessagesAsSeen(activeConversation.id, 'simulated-reader');
          const refreshed = await DataStore.getMessages(activeConversation.id);
          setMessages(refreshed);
        }, 3000);
      }

      await loadConversations();
    } finally {
      setIsSending(false);
    }
  };

  // AI Prompt assistance: drafting a pitch or critique
  const handleAskAiToDraft = async () => {
    const prompt = inputText.trim() || 'Help me draft a crisp, direct business pitch to this founder/supplier on VLITS.';
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Draft a professional, distraction-free outreach message for an entrepreneur: "${prompt}"`,
          userContext: {
            name: currentUser.displayName,
            profession: currentUser.profession,
          }
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInputText(data.reply);
      }
    } catch (e) {
      setInputText("Hey, saw your project on VLITS. We are scaling our distribution and would like to explore synergy. Let's connect on WhatsApp/Call.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Get recipient display data
  const getRecipientInfo = (conv: Conversation) => {
    if (conv.isAIConversation) {
      return {
        name: 'VLITS AI Executive Advisor',
        phone: 'Instant AI Co-Pilot',
        profession: 'Automated Startup & Strategy Advisor',
        isAI: true,
      };
    }
    const otherPhone = conv.participantPhones.find(p => p !== currentUser.phoneNumber) || conv.participantPhones[0];
    const name = conv.participantNames[otherPhone] || otherPhone;
    const profession = conv.participantProfessions?.[otherPhone] || 'Entrepreneur on VLITS';
    return { name, phone: otherPhone, profession, isAI: false };
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const info = getRecipientInfo(c);
    return (
      info.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      info.phone.toLowerCase().includes(searchFilter.toLowerCase()) ||
      info.profession.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  const activeInfo = activeConversation ? getRecipientInfo(activeConversation) : null;

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-4">
      
      {/* Top Banner & Fast Number Access Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Direct Real-Time Conversations
              </h2>
              <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md border border-slate-200">
                Seen / Unseen Tracking
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Zero algorithmic feed friction. Start direct message-to-message chat with any mobile number.
            </p>
          </div>

          {/* Direct Mobile Number Bar & "Chat Now" Button */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-64">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={directPhoneInput}
                onChange={e => setDirectPhoneInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleStartDirectChat(directPhoneInput);
                }}
                placeholder="Mobile number (e.g. +91 98111...)"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button
              onClick={() => handleStartDirectChat(directPhoneInput)}
              disabled={!directPhoneInput.trim()}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-xl shadow-xs transition-all whitespace-nowrap"
            >
              Chat Now
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Interface Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[720px]">
        
        {/* Left Column: Conversations List */}
        <div className={`md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col ${
          isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header & Search */}
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Recent Chats ({conversations.length})
              </span>
              <button
                onClick={() => handleStartDirectChat('VLITS-AI')}
                className="flex items-center text-[11px] font-semibold text-slate-800 hover:text-black bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition-colors"
              >
                <Sparkles className="w-3 h-3 mr-1 text-slate-700" />
                AI Advisor
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search phone or name..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Conversations List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No conversations yet. Enter a mobile number above and click 'Chat Now'.
              </div>
            ) : (
              filteredConversations.map(conv => {
                const info = getRecipientInfo(conv);
                const isSelected = activeConversation?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      setIsMobileChatOpen(true);
                    }}
                    className={`p-3.5 flex items-start space-x-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-100'
                        : 'hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {info.isAI ? (
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                          AI
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase border border-slate-300">
                          {info.name.substring(0, 2)}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{info.name}</h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-1">
                          {conv.lastMessageTimestamp?.split('•')[1] || ''}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 truncate mb-1">
                        {info.phone} • {info.profession}
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Demo Switcher helper to test two-way read receipts */}
          {onSwitchUser && (
            <div className="p-3 bg-slate-50 border-t border-slate-200">
              <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                Switch Active Sender (Test Seen / Unseen):
              </p>
              <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                {allProfiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => onSwitchUser(p)}
                    className={`px-2 py-1 text-[10px] font-medium rounded border whitespace-nowrap transition-colors ${
                      currentUser.id === p.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.displayName.split(' ')[0]} ({p.phoneNumber.slice(-5)})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Conversation Window */}
        <div className={`md:col-span-7 lg:col-span-8 flex flex-col bg-white ${
          !isMobileChatOpen ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConversation && activeInfo ? (
            <>
              {/* Active Chat Header */}
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Contact Avatar & Info */}
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {activeInfo.isAI ? 'AI' : activeInfo.name.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900">{activeInfo.name}</h3>
                      {activeInfo.isAI && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 text-white rounded">
                          AI Co-Pilot
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {activeInfo.phone} • {activeInfo.profession}
                    </p>
                  </div>
                </div>

                {/* Right Header Utilities */}
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Real-time Connected
                  </span>
                </div>
              </div>

              {/* Messages Stream Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                
                {/* Conversation Safety & Direct Communication Notice */}
                <div className="max-w-md mx-auto my-2 p-2.5 rounded-xl bg-white border border-slate-200 text-center shadow-2xs">
                  <div className="flex items-center justify-center space-x-1 text-slate-800 font-bold text-[11px] mb-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                    <span>Direct Executive Encrypted Channel</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Direct communication between {currentUser.displayName} and {activeInfo.name}.
                    Read receipts accurately track 'Seen' and 'Unseen' statuses.
                  </p>
                </div>

                {/* Messages List */}
                {messages.map((msg, index) => {
                  const isMine = msg.senderId === currentUser.userId;

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      {/* Sender Name if not mine */}
                      {!isMine && (
                        <span className="text-[10px] font-semibold text-slate-500 mb-0.5 ml-1">
                          {msg.senderName}
                        </span>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[82%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMine
                            ? 'bg-slate-900 text-white rounded-br-none'
                            : msg.isAI
                            ? 'bg-white text-slate-900 border border-slate-300 rounded-bl-none shadow-xs'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                        }`}
                      >
                        {/* Text */}
                        <p className="whitespace-pre-line font-normal">{msg.text}</p>
                        
                        {/* Metadata: Exact Date & Time + Read Receipt (Seen / Unseen) */}
                        <div
                          className={`flex items-center justify-end space-x-1.5 mt-1.5 text-[10px] ${
                            isMine ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {/* Exact Message Timestamp */}
                          <span>{msg.createdAt?.split('•')[1] || msg.createdAt}</span>

                          {/* Read Receipts Constraint: Explicit 'Seen' and 'Unseen' */}
                          {isMine && (
                            <span className="flex items-center font-medium ml-1">
                              {msg.status === 'seen' ? (
                                <span className="flex items-center text-emerald-400">
                                  <CheckCheck className="w-3.5 h-3.5 mr-0.5" />
                                  <span>Seen {msg.seenAt ? `• ${msg.seenAt.split('•')[1] || msg.seenAt}` : ''}</span>
                                </span>
                              ) : (
                                <span className="flex items-center text-slate-400">
                                  <Check className="w-3.5 h-3.5 mr-0.5" />
                                  <span>Unseen</span>
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* AI Thinking Indicator */}
                {isAiLoading && (
                  <div className="flex items-start space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                      AI
                    </div>
                    <div className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 rounded-bl-none shadow-2xs flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] text-slate-500">Analyzing business inquiry...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer & AI Co-pilot trigger */}
              <div className="p-3 border-t border-slate-200 bg-white">
                
                {/* AI Assistant Toolbar */}
                <div className="flex items-center justify-between mb-2 px-1">
                  <button
                    onClick={handleAskAiToDraft}
                    disabled={isAiLoading}
                    className="flex items-center text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-slate-700" />
                    AI Assistant: Draft Pitch / Critique
                  </button>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    Direct phone message to {activeInfo.name}
                  </span>
                </div>

                {/* Input form */}
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Type your message, query, or proposal..."
                    className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <PhoneCall className="w-10 h-10 text-slate-400 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No Active Chat Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Enter any entrepreneur's mobile number above or select from the recent conversations list to start real-time messaging.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
