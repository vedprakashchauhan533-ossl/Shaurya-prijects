import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, AlertCircle, ShieldCheck, Tag } from 'lucide-react';
import { PostCategory, UserProfile } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onPostCreated: (newPostData: {
    content: string;
    category: PostCategory;
    imageUrls: string[];
    externalLink?: string;
  }) => Promise<void>;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPostCreated,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('Idea');
  const [externalLink, setExternalLink] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image selection from device gallery/album
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorNotice(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check strict constraint: maximum 2 photos
    const totalCount = images.length + files.length;
    let allowedCount = 2 - images.length;

    if (totalCount > 2) {
      setErrorNotice('Constraint Notice: A maximum of 2 photos can be attached per post.');
    }

    if (allowedCount <= 0) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToRead = Array.from(files).slice(0, allowedCount);

    filesToRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImages(prev => {
            if (prev.length >= 2) return prev;
            return [...prev, uploadEvent.target!.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setErrorNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorNotice('Please write your idea, problem, or project details.');
      return;
    }

    // Double check constraint
    if (images.length > 2) {
      setErrorNotice('Maximum 2 photos allowed.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorNotice(null);
      await onPostCreated({
        content: content.trim(),
        category,
        imageUrls: images.slice(0, 2),
        externalLink: externalLink.trim() || undefined,
      });
      // Reset form
      setContent('');
      setCategory('Idea');
      setExternalLink('');
      setImages([]);
      onClose();
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: { label: PostCategory; desc: string }[] = [
    { label: 'Idea', desc: 'New business thesis or lean concept' },
    { label: 'MVP/Project', desc: 'Working prototype or early MVP launch' },
    { label: 'Business Problem', desc: 'Bottlenecks, sourcing, or scaling questions' },
    { label: 'Product/Link', desc: 'Physical product, software, or catalog' },
    { label: 'Thought', desc: 'Work discipline, mindset, or market reflection' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Create New Post</h2>
            <p className="text-xs text-slate-500">
              Share your MVP, idea, business issue, or product with verified founders
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Author Badge */}
          <div className="flex items-center space-x-3">
            <img
              src={currentUser.photoURL}
              alt={currentUser.displayName}
              className="w-10 h-10 rounded-full object-cover border border-slate-300"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">{currentUser.displayName}</p>
              <p className="text-xs text-slate-500">{currentUser.profession}</p>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-slate-600" />
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(cat.label)}
                  className={`text-left p-2 rounded-lg text-xs font-medium border transition-all ${
                    category === cat.label
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">{cat.label}</div>
                  <div className={`text-[10px] truncate ${category === cat.label ? 'text-slate-300' : 'text-slate-500'}`}>
                    {cat.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Post Content Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Idea, Problem, or Project Details *
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Explain your MVP milestone, specific business bottleneck, product features, or collaborative idea in detail..."
              rows={5}
              className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* External Link Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
              <LinkIcon className="w-3.5 h-3.5 mr-1 text-slate-600" />
              Product / MVP / Project Link (Optional)
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={e => setExternalLink(e.target.value)}
              placeholder="https://your-mvp-demo.com or prototype URL"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Gallery / Photos Selection (Max 2 Constraint) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center">
                <ImageIcon className="w-3.5 h-3.5 mr-1 text-slate-600" />
                Upload Photos from Gallery (Max 2 Photos)
              </label>
              <span className="text-[11px] font-medium text-slate-500">
                {images.length}/2 photos
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
            />

            {/* Photo Previews or Upload Trigger */}
            <div className="grid grid-cols-2 gap-3">
              {images.map((imgSrc, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 aspect-video bg-slate-100">
                  <img src={imgSrc} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-1 left-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium">
                    Photo {idx + 1} of 2
                  </div>
                </div>
              ))}

              {images.length < 2 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors aspect-video text-slate-600"
                >
                  <ImageIcon className="w-6 h-6 mb-1 text-slate-500" />
                  <span className="text-xs font-semibold">Select from Album/Gallery</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG, WEBP (Max 2)</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Notice */}
          {errorNotice && (
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Posts show exact publishing date and time metadata.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-all"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
