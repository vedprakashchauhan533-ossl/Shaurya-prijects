import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  ExternalLink, 
  Send, 
  Clock, 
  Phone, 
  MessageCircle, 
  Filter, 
  Search, 
  Plus, 
  Maximize2,
  X
} from 'lucide-react';
import { Post, PostCategory, UserProfile } from '../types';

interface FeedSectionProps {
  posts: Post[];
  currentUser: UserProfile;
  onLikePost: (postId: string) => Promise<void>;
  onAddComment: (postId: string, commentText: string) => Promise<void>;
  onStartChatWithAuthor: (authorPhone: string, authorName: string) => void;
  onOpenCreatePost: () => void;
}

export const FeedSection: React.FC<FeedSectionProps> = ({
  posts,
  currentUser,
  onLikePost,
  onAddComment,
  onStartChatWithAuthor,
  onOpenCreatePost,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesCat = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesQuery = 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorProfession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleCommentSubmit = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      setSubmittingCommentId(postId);
      await onAddComment(postId, text);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const handleShare = (post: Post) => {
    navigator.clipboard?.writeText(
      `Check out ${post.authorName}'s ${post.category} on VLITS: "${post.content.substring(0, 80)}..." Phone: ${post.authorPhoneNumber}`
    );
    setCopiedPostId(post.id);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const categories = ['All', 'MVP/Project', 'Business Problem', 'Idea', 'Product/Link', 'Thought'];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      
      {/* Feed Banner / Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Executive Feed & Real-Time Dealflow
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Zero distraction algorithm. Connect with teen builders, wholesalers, and startup founders.
              Post your MVP, solve real business bottlenecks, and initiate real-time conversations.
            </p>
          </div>
          <button
            onClick={onOpenCreatePost}
            className="flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Share MVP / Problem
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search ideas, MVPs, wholesalers, or problems..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Categories Bar */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-5">
        {filteredPosts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <Filter className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No posts found</p>
            <p className="text-xs text-slate-500 mt-1">
              Be the first to share an MVP, business problem, or market idea in this category!
            </p>
            <button
              onClick={onOpenCreatePost}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Post Now
            </button>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isLiked = post.likedBy?.includes(currentUser.userId);
            const isAuthor = post.authorId === currentUser.userId;

            return (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Post Header with Author & Exact Date/Time */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.authorPhotoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt={post.authorName}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 bg-slate-50"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-sm text-slate-900">{post.authorName}</h3>
                          <span className="text-[11px] px-2 py-0.5 font-semibold bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                            {post.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{post.authorProfession}</p>
                        
                        {/* Exact Date & Time Metadata (Mandatory Requirement) */}
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{post.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Chat With Author Action Button */}
                    {!isAuthor && post.authorPhoneNumber && (
                      <button
                        onClick={() => onStartChatWithAuthor(post.authorPhoneNumber, post.authorName)}
                        title={`Direct Message ${post.authorName}`}
                        className="flex items-center px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-300 rounded-lg transition-all shadow-2xs shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                        <span>Chat Now</span>
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mt-3 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                    {post.content}
                  </div>

                  {/* External MVP/Project Link if available */}
                  {post.externalLink && (
                    <div className="mt-3">
                      <a
                        href={post.externalLink.startsWith('http') ? post.externalLink : `https://${post.externalLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                        <span className="truncate max-w-xs">{post.externalLink}</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Photo Gallery: Strict Constraint (Max 2 Photos) */}
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="px-5 pb-3">
                    <div
                      className={`grid gap-2 rounded-xl overflow-hidden ${
                        post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      }`}
                    >
                      {post.imageUrls.slice(0, 2).map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewImage(imgUrl)}
                          className="relative group cursor-pointer bg-slate-100 border border-slate-200 rounded-xl overflow-hidden aspect-video"
                        >
                          <img
                            src={imgUrl}
                            alt={`Post attachment ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-102 duration-200"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 className="w-5 h-5 drop-shadow" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Action Bar: Upvote, Comment, Share */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-4">
                    {/* Upvote / Support */}
                    <button
                      onClick={() => onLikePost(post.id)}
                      className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                        isLiked
                          ? 'bg-slate-900 text-white font-bold'
                          : 'hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white text-white' : ''}`} />
                      <span>{post.likesCount || 0} Upvotes</span>
                    </button>

                    {/* Comment Toggle */}
                    <button
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-lg transition-colors ${
                        activeCommentPostId === post.id
                          ? 'bg-slate-200 text-slate-900 font-semibold'
                          : 'hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments?.length || post.commentsCount || 0} Comments</span>
                    </button>
                  </div>

                  {/* Share button */}
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center space-x-1 py-1 px-2.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedPostId === post.id ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>

                {/* Expandable Comments Section */}
                {activeCommentPostId === post.id && (
                  <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                    {/* Existing Comments List */}
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-2.5">
                        {post.comments.map(c => (
                          <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900">{c.authorName}</span>
                              <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                            </div>
                            <p className="text-slate-700 leading-normal">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic text-center py-2">
                        No comments yet. Share your feedback, advice, or collaboration idea!
                      </p>
                    )}

                    {/* New Comment Input Box */}
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        placeholder="Write a constructive feedback, quote, or response..."
                        className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-900"
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={submittingCommentId === post.id || !commentInputs[post.id]?.trim()}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Image Zoom Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Enlarged Post Asset"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-1.5 bg-white text-slate-900 rounded-full shadow-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
