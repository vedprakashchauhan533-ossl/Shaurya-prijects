import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Briefcase, 
  FileText, 
  Link as LinkIcon, 
  Save, 
  LogOut, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Users, 
  Camera,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileSectionProps {
  currentUser: UserProfile;
  allProfiles: UserProfile[];
  onUpdateProfile: (updated: UserProfile) => Promise<void>;
  onSwitchUser: (profile: UserProfile) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentUser,
  allProfiles,
  onUpdateProfile,
  onSwitchUser,
  onLogout,
  onDeleteAccount,
}) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber);
  const [profession, setProfession] = useState(currentUser.profession);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [companyOrMvpUrl, setCompanyOrMvpUrl] = useState(currentUser.companyOrMvpUrl || '');
  const [photoURL, setPhotoURL] = useState(currentUser.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete account confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !phoneNumber.trim()) {
      alert('Name and Mobile number are required.');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateProfile({
        ...currentUser,
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        profession: profession.trim(),
        bio: bio.trim(),
        companyOrMvpUrl: companyOrMvpUrl.trim(),
        photoURL: photoURL.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const predefinedAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="relative group">
            <img
              src={photoURL || currentUser.photoURL}
              alt={currentUser.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-300 shadow-sm"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{currentUser.displayName}</h1>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">{currentUser.profession}</p>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser.phoneNumber}</p>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center self-center sm:self-start px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                Active Executive Member
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed max-w-2xl">
              {currentUser.bio || 'No bio added yet. Describe your venture, MVP, or trade focus below.'}
            </p>

            {currentUser.companyOrMvpUrl && (
              <div className="mt-2">
                <a
                  href={currentUser.companyOrMvpUrl.startsWith('http') ? currentUser.companyOrMvpUrl : `https://${currentUser.companyOrMvpUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-medium text-slate-700 hover:text-slate-900 underline"
                >
                  <LinkIcon className="w-3 h-3 mr-1" />
                  {currentUser.companyOrMvpUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switch Demo Identity for Easy Testing */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Switch Profile / Identity</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            For testing real-time two-way chatting & read receipts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {allProfiles.map(p => {
            const isSelected = p.id === currentUser.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSwitchUser(p);
                  setDisplayName(p.displayName);
                  setPhoneNumber(p.phoneNumber);
                  setProfession(p.profession);
                  setBio(p.bio || '');
                  setCompanyOrMvpUrl(p.companyOrMvpUrl || '');
                  setPhotoURL(p.photoURL || '');
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={p.photoURL}
                  alt={p.displayName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-300"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{p.displayName}</p>
                  <p className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p.profession}
                  </p>
                  <p className={`text-[9px] truncate ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    {p.phoneNumber}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Edit Profile Details</h2>
            <p className="text-xs text-slate-500">Update your contact number, profession, and venture links</p>
          </div>
          {saveSuccess && (
            <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              Saved Successfully
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Full Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Mobile Number (Direct Chat Identifier) *
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
                placeholder="+91 98765 43210"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profession / Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Profession / Role *
              </label>
              <input
                type="text"
                value={profession}
                onChange={e => setProfession(e.target.value)}
                placeholder="e.g. Teen Founder, Wholesaler, Entrepreneur"
                required
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>

            {/* MVP / Company URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                <LinkIcon className="w-3.5 h-3.5 mr-1 text-slate-500" />
                MVP / Product / Business URL
              </label>
              <input
                type="url"
                value={companyOrMvpUrl}
                onChange={e => setCompanyOrMvpUrl(e.target.value)}
                placeholder="https://yourstartup.com"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Bio & Focus Area
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="What are you building, selling, or looking to collaborate on?"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 resize-none"
            />
          </div>

          {/* Avatar URL or Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              <Camera className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Profile Photo URL
            </label>
            <input
              type="url"
              value={photoURL}
              onChange={e => setPhotoURL(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 mb-2"
            />
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-500">Or pick preset:</span>
              {predefinedAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`preset-${i}`}
                  onClick={() => setPhotoURL(url)}
                  className={`w-7 h-7 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                    photoURL === url ? 'border-slate-900' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isSaving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Settings & Danger Zone */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Account Settings & Security
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Sign Out</h3>
            <p className="text-[11px] text-slate-500">End your active session on this browser</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Log Out
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Delete Account</h3>
            <p className="text-[11px] text-slate-500">
              Permanently delete your profile and personal posts from VLITS
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-slate-900">
              <div className="p-2 bg-slate-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Account Deletion</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              All your posts, chat records, and profile details for{' '}
              <span className="font-bold text-slate-900">{currentUser.displayName}</span> will be permanently removed.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type <span className="font-mono font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={e => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText !== 'DELETE'}
                onClick={() => {
                  onDeleteAccount();
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
