import React, { useState } from 'react';
import { X, Phone, UserCheck, MessageSquare } from 'lucide-react';
import { UserProfile } from '../types';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (phoneNumber: string) => void;
  allProfiles: UserProfile[];
  currentUserId: string;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  allProfiles,
  currentUserId,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    onStartChat(phoneNumber.trim());
    setPhoneNumber('');
    onClose();
  };

  const handleSelectContact = (phone: string) => {
    onStartChat(phone);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Direct Real-Time Message</h3>
            <p className="text-xs text-slate-500">Connect directly by typing any mobile number</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Mobile Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+91 98111 22334"
                  autoFocus
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!phoneNumber.trim()}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Start Direct Chat
            </button>
          </form>

          {/* Quick Contacts List */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Verified Builders on VLITS
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {allProfiles
                .filter(p => p.id !== currentUserId)
                .map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectContact(p.phoneNumber)}
                    className="p-2 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-300 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={p.photoURL}
                        alt={p.displayName}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">{p.displayName}</p>
                        <p className="text-[10px] text-slate-500">{p.profession}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {p.phoneNumber}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
