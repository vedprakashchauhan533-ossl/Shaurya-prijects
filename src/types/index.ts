export type PostCategory = 'Idea' | 'MVP/Project' | 'Business Problem' | 'Product/Link' | 'Thought';

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  phoneNumber: string;
  profession: string;
  bio: string;
  photoURL: string;
  companyOrMvpUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorProfession: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoneNumber: string;
  authorProfession: string;
  authorPhotoURL: string;
  content: string;
  category: PostCategory;
  imageUrls: string[]; // Strictly maximum 2 photos
  externalLink?: string;
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  comments: PostComment[];
  createdAt: string; // Exact date and time
}

export type MessageStatus = 'sent' | 'delivered' | 'seen';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  recipientPhone: string;
  text: string;
  isAI?: boolean;
  status: MessageStatus;
  seenAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantPhones: string[];
  participantNames: { [phone: string]: string };
  participantProfessions?: { [phone: string]: string };
  lastMessage: string;
  lastMessageTimestamp: string;
  lastMessageSenderId: string;
  unreadCount?: number;
  isAIConversation?: boolean;
}

export interface FinanceNewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  summary: string;
  timestamp: string;
  url: string;
  impact?: string;
  tags?: string[];
}

export interface MarketTicker {
  symbol: string;
  value: string;
  change: string;
  positive: boolean;
}
