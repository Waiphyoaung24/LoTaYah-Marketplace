'use client';

import React, { useState } from 'react';
import { Post } from '@/lib/types';
import { Button } from './Button';
import { MessageSquare, Heart, ShieldCheck, Star, Users, ArrowRight, User as UserIcon, MoreHorizontal, ShoppingBag, MessageCircle, ThumbsUp, MapPin, Globe } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

const PostItem: React.FC<{ post: Post; onLike: () => void }> = ({ post, onLike }) => {
  const { t } = useApp();
  const [expanded, setExpanded] = useState(false);
  const maxChars = 150;
  const isLongText = post.content.length > maxChars;

  const displayContent = expanded ? post.content : post.content.slice(0, maxChars) + (isLongText ? '...' : '');

  // Mock calculation for time ago
  const timeAgo = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / 3600000);
    if (hours < 1) return t.community.forum.justNow;
    if (hours > 24) return `${Math.floor(hours / 24)} days ago`;
    return `${hours} hours ago`;
  };

  return (
    <div className="bg-white rounded-none sm:rounded-xl shadow-sm border-b sm:border border-stone-100 animate-fade-in mb-4 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex-shrink-0 border border-stone-100">
            {post.userAvatar ? (
               <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-stone-100">
                 <UserIcon className="w-5 h-5 text-stone-400" />
               </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="font-bold text-stone-900 text-sm">{post.userName}</h4>
              {post.location && (
                <span className="text-xs text-stone-500 font-normal hidden sm:inline-flex items-center">
                   <span className="mx-1">•</span> <MapPin className="w-3 h-3 mr-0.5" /> {post.location}
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-stone-500 gap-1">
               <span>{post.location && <span className="sm:hidden text-amber-600 font-medium mr-1">{post.location}</span>}</span>
               <span>{timeAgo(post.timestamp)}</span>
               <span>•</span>
               <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>
        <button className="text-stone-400 hover:text-stone-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content Body */}
      <div className="px-4 pb-2">
         <p className="text-stone-800 text-sm leading-relaxed whitespace-pre-line">
           {displayContent}
           {isLongText && (
             <button 
               onClick={() => setExpanded(!expanded)}
               className="text-amber-600 font-medium ml-1 hover:underline"
             >
               {expanded ? t.community.forum.seeLess : t.community.forum.seeMore}
             </button>
           )}
         </p>
      </div>

      {/* Image Grid */}
      {post.images && post.images.length > 0 && (
        <div className="mt-2 grid gap-0.5 bg-stone-100 border-y border-stone-100" 
             style={{ 
               gridTemplateColumns: post.images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
               aspectRatio: post.images.length === 1 ? '16/9' : 'auto'
             }}>
          
          {post.images.slice(0, 3).map((img, idx) => (
             <div 
               key={idx} 
               className={`relative overflow-hidden ${
                 post.images!.length === 3 && idx === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'
               }`}
             >
               <img src={img} alt="" className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer" />
               
               {/* Overlay for +X images */}
               {post.images!.length > 3 && idx === 2 && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                   <span className="text-white font-bold text-2xl">+{post.images!.length - 3}</span>
                 </div>
               )}
             </div>
          ))}
        </div>
      )}

      {/* Stats Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-stone-50">
        <div className="flex items-center gap-2">
           {post.category === 'Sell' && (
             <div className="flex items-center px-2 py-1 bg-amber-50 rounded text-xs font-semibold text-amber-700">
               <ShoppingBag className="w-3 h-3 mr-1" />
               {t.community.forum.forSell}
             </div>
           )}
        </div>
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
              <Heart className="w-2.5 h-2.5 text-white fill-current" />
            </div>
            <span>{post.likes}</span>
          </div>
          <div className="flex items-center gap-1">
             <span>{post.comments.length} {t.community.forum.comments}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center px-2 py-1">
        <button 
          onClick={onLike}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-stone-500 hover:bg-stone-50 rounded-lg transition-colors group"
        >
          <ThumbsUp className={`w-5 h-5 ${post.likes > 0 ? 'text-amber-600' : 'group-hover:text-amber-600'}`} />
          <span className={`text-sm font-medium ${post.likes > 0 ? 'text-amber-600' : 'group-hover:text-amber-600'}`}>
            {t.community.forum.thank}
          </span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 text-stone-500 hover:bg-stone-50 rounded-lg transition-colors hover:text-stone-700">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{t.community.forum.reply}</span>
        </button>
      </div>
    </div>
  );
};

export const Community: React.FC = () => {
  const { user, t, stores, posts, handleAddPost, handleLikePost } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'forum' | 'merchants'>('forum');
  const [newPostContent, setNewPostContent] = useState('');

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPostContent.trim()) {
      handleAddPost(newPostContent);
      setNewPostContent('');
    }
  };

  const handleVisitStore = (storeId: string) => {
    router.push(`/browse?store=${storeId}`);
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-10">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8">
        
        {/* Mobile Header Tabs (Sticky) */}
        <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-stone-200 sm:hidden">
           <div className="flex">
             <button
                onClick={() => setActiveTab('forum')}
                className={`flex-1 py-3 text-sm font-medium text-center relative ${activeTab === 'forum' ? 'text-amber-600' : 'text-stone-500'}`}
             >
               {t.community.tabs.forum}
               {activeTab === 'forum' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600" />}
             </button>
             <button
                onClick={() => setActiveTab('merchants')}
                className={`flex-1 py-3 text-sm font-medium text-center relative ${activeTab === 'merchants' ? 'text-amber-600' : 'text-stone-500'}`}
             >
               {t.community.tabs.merchants}
               {activeTab === 'merchants' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-600" />}
             </button>
           </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block text-center mb-10 mt-4">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">{t.community.title}</h1>
          <p className="text-stone-500 max-w-2xl mx-auto mb-8">
            Connect with other buyers, share reviews, and find trusted merchants.
          </p>
          
          <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-stone-200">
            <button
              onClick={() => setActiveTab('forum')}
              className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'forum'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              {t.community.tabs.forum}
            </button>
            <button
              onClick={() => setActiveTab('merchants')}
              className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'merchants'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              {t.community.tabs.merchants}
            </button>
          </div>
        </div>

        {activeTab === 'forum' ? (
          <div className="max-w-2xl mx-auto">
            {/* Create Post Widget */}
            <div className="bg-white p-4 sm:p-6 sm:rounded-xl shadow-sm border-b sm:border border-stone-200 mb-4 sm:mb-8">
              {user ? (
                <form onSubmit={handleSubmitPost}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-amber-700">{user.name.charAt(0)}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="bg-stone-100 rounded-2xl px-4 py-2.5">
                        <textarea
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          placeholder={t.community.forum.placeholder}
                          className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm min-h-[40px] placeholder-stone-500"
                          style={{ height: 'auto' }}
                          rows={1}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-3 pl-2">
                        <div className="flex gap-4 text-stone-400">
                           {/* Placeholder icons for media upload */}
                           <div className="w-6 h-6 rounded bg-stone-100 cursor-pointer hover:bg-stone-200 transition-colors"></div>
                           <div className="w-6 h-6 rounded bg-stone-100 cursor-pointer hover:bg-stone-200 transition-colors"></div>
                        </div>
                        <Button type="submit" size="sm" disabled={!newPostContent.trim()}>
                          {t.community.forum.postBtn}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-stone-500 text-sm mb-2">{t.community.forum.loginToPost}</p>
                  <Button size="sm" variant="outline" onClick={() => router.push('/login')}>
                     Login
                  </Button>
                </div>
              )}
            </div>

            {/* Feed List */}
            <div>
              {posts.map(post => (
                <PostItem key={post.id} post={post} onLike={() => handleLikePost(post.id)} />
              ))}
            </div>
          </div>
        ) : (
          /* Merchant Trust Leaderboard */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
            {stores.map((store, index) => {
               const score = store.reputationScore || Math.floor(Math.random() * (100 - 80) + 80);
               return (
                <div key={store.id} className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-24 bg-stone-900 relative">
                    <img src={store.coverImage || `https://picsum.photos/seed/${store.id}/800/200`} alt={store.name} className="w-full h-full object-cover opacity-50" />
                    <div className="absolute -bottom-10 left-6">
                       <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden">
                         <img src={store.logoImage || `https://picsum.photos/seed/${store.id}logo/200/200`} alt={store.name} className="w-full h-full object-cover" />
                       </div>
                    </div>
                  </div>
                  
                  <div className="pt-12 px-6 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                         <h3 className="text-lg font-bold text-stone-900 flex items-center">
                           {store.name}
                           {store.verified && <ShieldCheck className="w-4 h-4 text-blue-500 ml-1" title="Verified Merchant" />}
                         </h3>
                         <p className="text-sm text-stone-500 flex items-center mt-1">
                           <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                           High Rated Merchant
                         </p>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-2xl font-bold text-amber-600">{score}</span>
                         <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Trust Score</span>
                      </div>
                    </div>

                    <p className="text-sm text-stone-600 mb-4 line-clamp-2 min-h-[40px]">
                      {store.description || "No description available."}
                    </p>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleVisitStore(store.id)}
                    >
                      {t.community.trust.visit} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

