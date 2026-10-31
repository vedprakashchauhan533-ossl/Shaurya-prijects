import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FeedSection } from './components/FeedSection';
import { CreatePostModal } from './components/CreatePostModal';
import { ChatSection } from './components/ChatSection';
import { UpdatesSection } from './components/UpdatesSection';
import { ProfileSection } from './components/ProfileSection';
import { DirectChatModal } from './components/DirectChatModal';
import { UserProfile, Post, PostCategory } from './types';
import { DataStore, INITIAL_PROFILES } from './lib/dataStore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'chats' | 'updates' | 'profile'>('feed');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DataStore.getCurrentUser());
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(DataStore.getAllProfiles());
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isDirectChatModalOpen, setIsDirectChatModalOpen] = useState(false);
  const [directChatTargetPhone, setDirectChatTargetPhone] = useState<string | undefined>(undefined);
  const [directChatTargetName, setDirectChatTargetName] = useState<string | undefined>(undefined);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Load posts and profiles
  const loadInitialData = async () => {
    const fetchedPosts = await DataStore.getPosts();
    setPosts(fetchedPosts);
    setAllProfiles(DataStore.getAllProfiles());
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Post creation handler
  const handleCreatePost = async (newPostData: {
    content: string;
    category: PostCategory;
    imageUrls: string[];
    externalLink?: string;
  }) => {
    const created = await DataStore.createPost({
      authorId: currentUser.userId,
      authorName: currentUser.displayName,
      authorPhoneNumber: currentUser.phoneNumber,
      authorProfession: currentUser.profession,
      authorPhotoURL: currentUser.photoURL,
      content: newPostData.content,
      category: newPostData.category,
      imageUrls: newPostData.imageUrls,
      externalLink: newPostData.externalLink,
    });

    setPosts(prev => [created, ...prev]);
  };

  // Upvote / Like handler
  const handleLikePost = async (postId: string) => {
    const updated = await DataStore.toggleLikePost(postId, currentUser.userId);
    if (updated) {
      setPosts(prev => prev.map(p => (p.id === postId ? { ...updated } : p)));
    }
  };

  // Add Comment handler
  const handleAddComment = async (postId: string, commentText: string) => {
    const comment = await DataStore.addComment(postId, currentUser, commentText);
    if (comment) {
      const refreshed = await DataStore.getPosts();
      setPosts(refreshed);
    }
  };

  // 1-Click Chat with Author from feed
  const handleStartChatWithAuthor = (authorPhone: string, authorName: string) => {
    setDirectChatTargetPhone(authorPhone);
    setDirectChatTargetName(authorName);
    setActiveTab('chats');
  };

  // Direct Number Chat from modal
  const handleStartChatFromModal = (phone: string) => {
    setDirectChatTargetPhone(phone);
    setActiveTab('chats');
  };

  // Switch Active User (Identity Switcher)
  const handleSwitchUser = async (profile: UserProfile) => {
    await DataStore.setCurrentUser(profile);
    setCurrentUser(profile);
    setAllProfiles(DataStore.getAllProfiles());
  };

  // Update Profile
  const handleUpdateProfile = async (updated: UserProfile) => {
    await DataStore.setCurrentUser(updated);
    setCurrentUser(updated);
    setAllProfiles(DataStore.getAllProfiles());
    // Refresh posts author name if updated
    const refreshed = await DataStore.getPosts();
    setPosts(refreshed);
  };

  // Delete Account
  const handleDeleteAccount = () => {
    DataStore.deleteAccount(currentUser.userId);
    // Switch to first remaining demo profile or fallback
    const remaining = INITIAL_PROFILES.filter(p => p.id !== currentUser.id);
    const nextUser = remaining[0] || INITIAL_PROFILES[0];
    DataStore.setCurrentUser(nextUser);
    setCurrentUser(nextUser);
    loadInitialData();
    setActiveTab('feed');
  };

  // Logout
  const handleLogout = () => {
    const defaultUser = INITIAL_PROFILES[0];
    DataStore.setCurrentUser(defaultUser);
    setCurrentUser(defaultUser);
    setActiveTab('feed');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white pb-16 md:pb-6">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenDirectChatModal={() => setIsDirectChatModalOpen(true)}
        unreadMessagesCount={unreadCount}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1">
        {activeTab === 'feed' && (
          <FeedSection
            posts={posts}
            currentUser={currentUser}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onStartChatWithAuthor={handleStartChatWithAuthor}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
          />
        )}

        {activeTab === 'chats' && (
          <ChatSection
            currentUser={currentUser}
            initialTargetPhone={directChatTargetPhone}
            initialTargetName={directChatTargetName}
            onClearInitialTarget={() => {
              setDirectChatTargetPhone(undefined);
              setDirectChatTargetName(undefined);
            }}
            onSwitchUser={handleSwitchUser}
            allProfiles={allProfiles}
          />
        )}

        {activeTab === 'updates' && (
          <UpdatesSection />
        )}

        {activeTab === 'profile' && (
          <ProfileSection
            currentUser={currentUser}
            allProfiles={allProfiles}
            onUpdateProfile={handleUpdateProfile}
            onSwitchUser={handleSwitchUser}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        currentUser={currentUser}
        onPostCreated={handleCreatePost}
      />

      {/* Direct Phone Number Chat Modal */}
      <DirectChatModal
        isOpen={isDirectChatModalOpen}
        onClose={() => setIsDirectChatModalOpen(false)}
        onStartChat={handleStartChatFromModal}
        allProfiles={allProfiles}
        currentUserId={currentUser.id}
      />
    </div>
  );
}
