import React from 'react';
import { 
  Home, 
  MessageSquare, 
  TrendingUp, 
  User, 
  Plus, 
  Sparkles, 
  PhoneCall,
  ShieldCheck 
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: 'feed' | 'chats' | 'updates' | 'profile';
  setActiveTab: (tab: 'feed' | 'chats' | 'updates' | 'profile') => void;
  currentUser: UserProfile;
  onOpenCreatePost: () => void;
  onOpenDirectChatModal: () => void;
  unreadMessagesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenCreatePost,
  onOpenDirectChatModal,
  unreadMessagesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-sm">
              V
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">VLITS</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  <ShieldCheck className="w-3 h-3 mr-1 text-slate-700" />
                  Productive Network
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">
                For Teenagers, Entrepreneurs & Business Leaders
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Feed & Ideas
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chats'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chats & Messages
              {unreadMessagesCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-bold bg-slate-700 text-white rounded-full">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'updates'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Finance Updates
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Direct Number Chat Trigger */}
            <button
              onClick={onOpenDirectChatModal}
              title="Start Chat with any Mobile Number"
              className="hidden sm:flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-slate-700" />
              Direct Number
            </button>

            {/* Post Creation '+' Button */}
            <button
              onClick={onOpenCreatePost}
              className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">New Post</span>
            </button>

            {/* User Avatar Chip */}
            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-2 pl-2 border-l border-slate-200 cursor-pointer"
            >
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 bg-slate-100"
              />
              <div className="hidden lg:block text-left text-xs leading-tight">
                <p className="font-semibold text-slate-900 max-w-[120px] truncate">{currentUser.displayName}</p>
                <p className="text-[10px] text-slate-500 max-w-[120px] truncate">{currentUser.phoneNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'feed' ? 'text-slate-900' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`relative flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'chats' ? 'text-slate-900' : 'text-slate-500'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Chats</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-slate-900 rounded-full" />
          )}
        </button>

        <button
          onClick={onOpenCreatePost}
          className="flex items-center justify-center -mt-5 w-11 h-11 bg-slate-900 text-white rounded-full shadow-md hover:bg-slate-800"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('updates')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'updates' ? 'text-slate-900' : 'text-slate-500'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span>Finance</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center py-1 text-xs font-medium ${
            activeTab === 'profile' ? 'text-slate-900' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </button>
      </div>
    </header>
  );
};
