import { UserProfile, Post, Conversation, ChatMessage, PostComment } from '../types';
import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firestoreErrors';

// Utility to format exact date and time as required
export function formatExactDateTime(dateInput: Date | string | number = new Date()): string {
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }) + ' • ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Default initial demo profiles for testing and immediate use
export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-ved',
    userId: 'user-ved',
    displayName: 'Ved Prakash Chauhan',
    phoneNumber: '+91 98765 43210',
    profession: 'Founder & Full-Stack Architect',
    bio: 'Building VLITS: Eliminating mindless social media doomscrolling for serious founders, teenagers, and business traders.',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    companyOrMvpUrl: 'https://vlits.network',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-aarav',
    userId: 'user-aarav',
    displayName: 'Aarav Gupta',
    phoneNumber: '+91 98111 22334',
    profession: 'Teen Tech Founder (17 y/o)',
    bio: 'Building an automated inventory reconciliation micro-SaaS for local FMCG retailers. Looking for wholesale pilot partners.',
    photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    companyOrMvpUrl: 'https://reconcile-mvp.io',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'user-rajesh',
    userId: 'user-rajesh',
    displayName: 'Rajesh Singhania',
    phoneNumber: '+91 98222 33445',
    profession: 'Industrial Textile Wholesaler',
    bio: '22+ years in Pan-India yarn and cotton logistics. Looking to connect with young D2C apparel brands for bulk fabric supply.',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    companyOrMvpUrl: 'https://singhaniatextiles.com',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'user-ananya',
    userId: 'user-ananya',
    displayName: 'Ananya Sharma',
    phoneNumber: '+91 98333 44556',
    profession: 'Fintech Product Strategist',
    bio: 'Ex-Stripe builder. Advising early-stage B2B platforms on cross-border payments and escrow contracts.',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    companyOrMvpUrl: 'https://ananyasharma.me',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  }
];

// Seed posts sharing MVP, business problems, products, ideas
export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-101',
    authorId: 'user-aarav',
    authorName: 'Aarav Gupta',
    authorPhoneNumber: '+91 98111 22334',
    authorProfession: 'Teen Tech Founder (17 y/o)',
    authorPhotoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    content: 'Shipped v0.1 MVP of our offline-first billing scanner for kirana stores. Replaces manual paper bahi-khata with 1-click WhatsApp payment reminders. Tested in 4 stores in Surat, saved ~3.5 hours/week for shopkeepers. Seeking feedback from wholesale distribution leaders on how to integrate bulk purchase receipts.',
    category: 'MVP/Project',
    imageUrls: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
    ],
    externalLink: 'https://reconcile-mvp.io',
    likesCount: 28,
    likedBy: ['user-ved', 'user-rajesh'],
    commentsCount: 3,
    comments: [
      {
        id: 'c-1',
        postId: 'post-101',
        authorId: 'user-rajesh',
        authorName: 'Rajesh Singhania',
        authorProfession: 'Industrial Textile Wholesaler',
        authorPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        content: 'Impressive work for a 17-year old. Does it handle credit reconciliation for 30-day deferred payments? DM me on my mobile number, let us chat.',
        createdAt: formatExactDateTime(new Date(Date.now() - 3600000 * 2)),
      },
      {
        id: 'c-2',
        postId: 'post-101',
        authorId: 'user-ved',
        authorName: 'Ved Prakash Chauhan',
        authorProfession: 'Founder & Full-Stack Architect',
        authorPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        content: 'Clean architecture! Make sure your sync works reliably over spotty 2G/3G in warehouse basements.',
        createdAt: formatExactDateTime(new Date(Date.now() - 3600000 * 1)),
      }
    ],
    createdAt: formatExactDateTime(new Date(Date.now() - 3600000 * 4)),
  },
  {
    id: 'post-102',
    authorId: 'user-rajesh',
    authorName: 'Rajesh Singhania',
    authorPhoneNumber: '+91 98222 33445',
    authorProfession: 'Industrial Textile Wholesaler',
    authorPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    content: 'Business Bottleneck: Our factory in Ahmedabad has surplus organic combed cotton yarn (30s & 40s count, certified OEKO-TEX). We usually sell to export agents, but traditional export factoring is taking 45 days. Want to supply directly to high-growth Indian D2C streetwear startups with zero intermediary commission.',
    category: 'Business Problem',
    imageUrls: [
      'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?w=800&auto=format&fit=crop&q=80'
    ],
    externalLink: 'https://singhaniatextiles.com',
    likesCount: 42,
    likedBy: ['user-ved', 'user-ananya'],
    commentsCount: 1,
    comments: [
      {
        id: 'c-3',
        postId: 'post-102',
        authorId: 'user-ananya',
        authorName: 'Ananya Sharma',
        authorProfession: 'Fintech Product Strategist',
        content: 'Rajesh ji, direct digital invoice factoring can unlock your capital in 24 hours. Will ping your number.',
        createdAt: formatExactDateTime(new Date(Date.now() - 3600000 * 6)),
      }
    ],
    createdAt: formatExactDateTime(new Date(Date.now() - 3600000 * 10)),
  },
  {
    id: 'post-103',
    authorId: 'user-ananya',
    authorName: 'Ananya Sharma',
    authorPhoneNumber: '+91 98333 44556',
    authorProfession: 'Fintech Product Strategist',
    authorPhotoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    content: 'Core Idea for Young Founders: Stop spending 4 hours a day watching algorithmic short-video reels. If you redirect that attention toward cold-messaging 5 suppliers and 5 prospective enterprise customers every single morning, your startup velocity triples. Communication is the ultimate business multiplier.',
    category: 'Idea',
    imageUrls: [],
    likesCount: 89,
    likedBy: ['user-ved', 'user-aarav', 'user-rajesh'],
    commentsCount: 0,
    comments: [],
    createdAt: formatExactDateTime(new Date(Date.now() - 86400000 * 1)),
  }
];

// Seed initial conversations
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-ai',
    participantIds: ['user-ved', 'vlits-ai'],
    participantPhones: ['+91 98765 43210', 'VLITS-AI'],
    participantNames: {
      '+91 98765 43210': 'Ved Prakash Chauhan',
      'VLITS-AI': 'VLITS AI Executive Advisor',
    },
    participantProfessions: {
      'VLITS-AI': 'Startup Co-Founder & Business Strategist',
    },
    lastMessage: 'Ready to critique your MVP roadmap, financial structure, or vendor outreach pitch.',
    lastMessageTimestamp: formatExactDateTime(new Date(Date.now() - 1000 * 60 * 15)),
    lastMessageSenderId: 'vlits-ai',
    unreadCount: 0,
    isAIConversation: true,
  },
  {
    id: 'conv-aarav-ved',
    participantIds: ['user-ved', 'user-aarav'],
    participantPhones: ['+91 98765 43210', '+91 98111 22334'],
    participantNames: {
      '+91 98765 43210': 'Ved Prakash Chauhan',
      '+91 98111 22334': 'Aarav Gupta',
    },
    participantProfessions: {
      '+91 98111 22334': 'Teen Tech Founder (17 y/o)',
    },
    lastMessage: 'Thanks for reviewing the MVP! Rajesh ji also connected regarding pilot integration.',
    lastMessageTimestamp: formatExactDateTime(new Date(Date.now() - 1000 * 60 * 45)),
    lastMessageSenderId: 'user-aarav',
    unreadCount: 0,
  }
];

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-ai-1',
    conversationId: 'conv-ai',
    senderId: 'vlits-ai',
    senderName: 'VLITS AI Executive Advisor',
    senderPhone: 'VLITS-AI',
    recipientPhone: '+91 98765 43210',
    text: 'Welcome to VLITS! I am your AI Business Advisor. Ask me anything about validating business ideas, customer acquisition, lean MVPs, or overcoming supply chain challenges.',
    isAI: true,
    status: 'seen',
    seenAt: formatExactDateTime(new Date(Date.now() - 1000 * 60 * 30)),
    createdAt: formatExactDateTime(new Date(Date.now() - 1000 * 60 * 30)),
  },
  {
    id: 'msg-1',
    conversationId: 'conv-aarav-ved',
    senderId: 'user-ved',
    senderName: 'Ved Prakash Chauhan',
    senderPhone: '+91 98765 43210',
    recipientPhone: '+91 98111 22334',
    text: 'Hey Aarav! Loved your post on the offline-first billing scanner. How are you handling store owner authentication?',
    status: 'seen',
    seenAt: formatExactDateTime(new Date(Date.now() - 1000 * 60 * 50)),
    createdAt: formatExactDateTime(new Date(Date.now() - 1000 * 60 * 55)),
  },
  {
    id: 'msg-2',
    conversationId: 'conv-aarav-ved',
    senderId: 'user-aarav',
    senderName: 'Aarav Gupta',
    senderPhone: '+91 98111 22334',
    recipientPhone: '+91 98765 43210',
    text: 'Thanks for reviewing the MVP! Rajesh ji also connected regarding pilot integration. We use simple phone OTP + biometric device token so owners never forget passwords.',
    status: 'seen',
    seenAt: formatExactDateTime(new Date(Date.now() - 1000 * 60 * 40)),
    createdAt: formatExactDateTime(new Date(Date.now() - 1000 * 60 * 45)),
  }
];

// Local persistence storage helper
const STORAGE_KEYS = {
  CURRENT_USER: 'vlits_current_user_v1',
  POSTS: 'vlits_posts_v1',
  CONVERSATIONS: 'vlits_conversations_v1',
  MESSAGES: 'vlits_messages_v1',
  PROFILES: 'vlits_profiles_v1',
};

export class DataStore {
  // Get active user profile
  static getCurrentUser(): UserProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read user from storage', e);
    }
    // Default user is Ved Prakash Chauhan
    const defaultUser = INITIAL_PROFILES[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    return defaultUser;
  }

  // Update active user profile
  static async setCurrentUser(profile: UserProfile): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
    
    // Also update in profiles list
    const profiles = this.getAllProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id || p.phoneNumber === profile.phoneNumber);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    // Sync to Firestore if authenticated
    try {
      if (auth.currentUser && db) {
        await setDoc(doc(db, 'users', profile.userId), {
          ...profile,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('Firestore user profile sync note:', error);
    }
  }

  // Get all known user profiles
  static getAllProfiles(): UserProfile[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(INITIAL_PROFILES));
    return INITIAL_PROFILES;
  }

  // Find profile by mobile number
  static getProfileByPhone(phone: string): UserProfile | undefined {
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.phoneNumber.replace(/[\s\-\(\)]/g, '') === clean);
  }

  // Get all posts
  static async getPosts(): Promise<Post[]> {
    let posts = [...INITIAL_POSTS];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (saved) {
        posts = JSON.parse(saved);
      } else {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
      }
    } catch (e) {
      console.error(e);
    }
    return posts;
  }

  // Create new post (Strictly enforced constraint: maximum 2 photos)
  static async createPost(
    postData: Omit<Post, 'id' | 'likesCount' | 'likedBy' | 'commentsCount' | 'comments' | 'createdAt'>
  ): Promise<Post> {
    if (postData.imageUrls && postData.imageUrls.length > 2) {
      throw new Error('Constraint Violation: Maximum 2 photos can be attached to a post.');
    }

    const newPost: Post = {
      ...postData,
      id: 'post-' + Date.now(),
      imageUrls: (postData.imageUrls || []).slice(0, 2),
      likesCount: 0,
      likedBy: [],
      commentsCount: 0,
      comments: [],
      createdAt: formatExactDateTime(),
    };

    const currentPosts = await this.getPosts();
    const updated = [newPost, ...currentPosts];
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updated));

    // Sync to Firestore
    try {
      if (auth.currentUser && db) {
        await setDoc(doc(db, 'posts', newPost.id), {
          ...newPost,
          serverCreatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Firestore post sync notice:', err);
    }

    return newPost;
  }

  // Like or Unlike post
  static async toggleLikePost(postId: string, userId: string): Promise<Post | null> {
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    const alreadyLiked = post.likedBy.includes(userId);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedBy.push(userId);
      post.likesCount += 1;
    }

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return post;
  }

  // Add comment to post
  static async addComment(postId: string, user: UserProfile, content: string): Promise<PostComment | null> {
    const posts = await this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return null;

    const comment: PostComment = {
      id: 'comment-' + Date.now(),
      postId,
      authorId: user.userId,
      authorName: user.displayName,
      authorProfession: user.profession,
      authorPhotoURL: user.photoURL,
      content,
      createdAt: formatExactDateTime(),
    };

    post.comments = post.comments || [];
    post.comments.push(comment);
    post.commentsCount = post.comments.length;

    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    return comment;
  }

  // Get conversations for current user
  static async getConversations(currentUserPhone: string): Promise<Conversation[]> {
    let conversations: Conversation[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (saved) {
        conversations = JSON.parse(saved);
      } else {
        conversations = INITIAL_CONVERSATIONS;
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
      }
    } catch (e) {
      conversations = INITIAL_CONVERSATIONS;
    }
    return conversations;
  }

  // Start or get conversation by phone number
  static async getOrCreateConversationByPhone(
    currentUser: UserProfile,
    targetPhone: string
  ): Promise<Conversation> {
    const cleanTargetPhone = targetPhone.trim();
    if (!cleanTargetPhone) {
      throw new Error('Please enter a valid mobile number');
    }

    const conversations = await this.getConversations(currentUser.phoneNumber);
    
    // Check if target is AI
    const isAI = cleanTargetPhone.toLowerCase().includes('ai') || cleanTargetPhone === 'VLITS-AI';
    
    const existing = conversations.find(c => {
      if (isAI) return c.isAIConversation || c.participantPhones.includes('VLITS-AI');
      return c.participantPhones.some(p => p.replace(/[\s\-\(\)]/g, '') === cleanTargetPhone.replace(/[\s\-\(\)]/g, ''));
    });

    if (existing) {
      return existing;
    }

    // Try finding matching profile
    const targetProfile = this.getProfileByPhone(cleanTargetPhone);
    const targetName = targetProfile ? targetProfile.displayName : `User (${cleanTargetPhone})`;
    const targetProfession = targetProfile ? targetProfile.profession : 'Entrepreneur on VLITS';

    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      participantIds: [currentUser.userId, targetProfile?.userId || 'user-' + Date.now()],
      participantPhones: [currentUser.phoneNumber, cleanTargetPhone],
      participantNames: {
        [currentUser.phoneNumber]: currentUser.displayName,
        [cleanTargetPhone]: targetName,
      },
      participantProfessions: {
        [currentUser.phoneNumber]: currentUser.profession,
        [cleanTargetPhone]: targetProfession,
      },
      lastMessage: 'Conversation started',
      lastMessageTimestamp: formatExactDateTime(),
      lastMessageSenderId: currentUser.userId,
      unreadCount: 0,
      isAIConversation: isAI,
    };

    const updated = [newConv, ...conversations];
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updated));
    return newConv;
  }

  // Get messages for a conversation
  static async getMessages(conversationId: string): Promise<ChatMessage[]> {
    let allMessages: ChatMessage[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (saved) {
        allMessages = JSON.parse(saved);
      } else {
        allMessages = INITIAL_MESSAGES;
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
      }
    } catch (e) {
      allMessages = INITIAL_MESSAGES;
    }

    return allMessages.filter(m => m.conversationId === conversationId);
  }

  // Send a message
  static async sendMessage(
    conversationId: string,
    sender: UserProfile,
    recipientPhone: string,
    text: string
  ): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      conversationId,
      senderId: sender.userId,
      senderName: sender.displayName,
      senderPhone: sender.phoneNumber,
      recipientPhone,
      text,
      status: 'sent', // Will change to seen when viewed
      createdAt: formatExactDateTime(),
    };

    // Load existing messages
    let allMessages: ChatMessage[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      allMessages = saved ? JSON.parse(saved) : [...INITIAL_MESSAGES];
    } catch (e) {
      allMessages = [...INITIAL_MESSAGES];
    }

    allMessages.push(newMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

    // Update conversation last message
    const conversations = await this.getConversations(sender.phoneNumber);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageTimestamp = newMessage.createdAt;
      conv.lastMessageSenderId = sender.userId;
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }

    return newMessage;
  }

  // Mark all messages in a conversation as seen by reader
  static async markMessagesAsSeen(conversationId: string, readerUserId: string): Promise<void> {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!saved) return;
      const allMessages: ChatMessage[] = JSON.parse(saved);
      let changed = false;

      for (const msg of allMessages) {
        // If message is in this conversation and sent by someone other than the reader and not yet seen
        if (msg.conversationId === conversationId && msg.senderId !== readerUserId && msg.status !== 'seen') {
          msg.status = 'seen';
          msg.seenAt = formatExactDateTime();
          changed = true;
        }
      }

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
      }
    } catch (e) {
      console.warn('Failed to mark seen:', e);
    }
  }

  // Simulate or execute AI reply
  static async requestAIReply(
    conversationId: string,
    userMessage: string,
    user: UserProfile
  ): Promise<ChatMessage> {
    let replyText = '';
    try {
      const res = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          userContext: {
            name: user.displayName,
            profession: user.profession,
          }
        }),
      });
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply;
      }
    } catch (e) {
      console.warn('AI API fetch error, fallback activated', e);
    }

    if (!replyText) {
      replyText = `Focus on direct distribution. Reach out to at least 3 potential business partners on VLITS today. Validate before scaling capital expenditure.`;
    }

    const aiMessage: ChatMessage = {
      id: 'msg-ai-' + Date.now(),
      conversationId,
      senderId: 'vlits-ai',
      senderName: 'VLITS AI Executive Advisor',
      senderPhone: 'VLITS-AI',
      recipientPhone: user.phoneNumber,
      text: replyText,
      isAI: true,
      status: 'seen',
      seenAt: formatExactDateTime(),
      createdAt: formatExactDateTime(),
    };

    // Store message
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const allMessages: ChatMessage[] = saved ? JSON.parse(saved) : [...INITIAL_MESSAGES];
    allMessages.push(aiMessage);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

    // Update conversation
    const conversations = await this.getConversations(user.phoneNumber);
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessage = replyText;
      conv.lastMessageTimestamp = aiMessage.createdAt;
      conv.lastMessageSenderId = 'vlits-ai';
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    }

    return aiMessage;
  }

  // Delete account
  static deleteAccount(userId: string): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    // Remove user's posts
    try {
      const savedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (savedPosts) {
        const posts: Post[] = JSON.parse(savedPosts);
        const filtered = posts.filter(p => p.authorId !== userId);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(filtered));
      }
    } catch (e) {}
  }
}
