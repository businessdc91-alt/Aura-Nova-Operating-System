'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Smile,
  Hash,
  AtSign,
  Pin,
  Flag,
  Trash2,
  Edit,
  Copy,
  Bookmark,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';
import {
  Post,
  Comment,
  SocialUser,
  getPosts,
  createPost,
  likePost,
  sharePost,
  deletePost,
  getComments,
  addComment,
  likeComment,
  getCurrentUser,
  isFollowing,
  followUser,
  unfollowUser,
} from '@/services/socialNetworkService';
import { startConversationWithUser } from '@/services/directMessageService';

// ================== TYPES ==================
interface SocialFeedProps {
  userId?: string; // If provided, show only this user's posts
  tag?: string;    // Filter by tag
  showComposer?: boolean;
  limit?: number;
  compact?: boolean;
  className?: string;
}

// ================== HELPERS ==================
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// ================== TIER COLORS ==================
const TIER_COLORS = {
  free: 'text-slate-400',
  creator: 'text-blue-400',
  developer: 'text-purple-400',
  catalyst: 'text-orange-400',
  prime: 'text-amber-400',
};

// ================== POST COMPOSER ==================
function PostComposer({ onPostCreated }: { onPostCreated: (post: Post) => void }) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentUser = getCurrentUser();

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please write something!');
      return;
    }

    setIsPosting(true);
    try {
      const newPost = createPost(content, { tags });
      onPostCreated(newPost);
      setContent('');
      setTags([]);
      setIsExpanded(false);
      toast.success('Posted successfully! 🎉');
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const addTag = (tag: string) => {
    const cleaned = tag.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
      setTags([...tags, cleaned]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <Card className="bg-slate-900/80 border-slate-800 mb-4">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0">
            {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>

          {/* Input area */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's on your mind? Share your creations, ask questions, or just say hi! 👋"
              className="bg-slate-800/50 border-slate-700 min-h-[60px] resize-none text-white placeholder:text-slate-500"
              rows={isExpanded ? 4 : 2}
            />

            {/* Expanded options */}
            {isExpanded && (
              <div className="mt-3 space-y-3">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-aura-600/30 text-aura-400 rounded-full text-xs flex items-center gap-1"
                    >
                      <Hash size={10} />
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-white">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {tags.length < 5 && (
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addTag(tagInput);
                        }
                      }}
                      placeholder="Add tags..."
                      className="w-24 h-7 text-xs bg-transparent border-none px-1"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <ImageIcon size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <Smile size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                      <AtSign size={18} />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      {content.length}/500
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent('');
                        setTags([]);
                      }}
                      className="text-slate-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!content.trim() || isPosting}
                      className="bg-aura-600 hover:bg-aura-700"
                      size="sm"
                    >
                      {isPosting ? (
                        <span className="animate-spin mr-2">⏳</span>
                      ) : (
                        <Send size={14} className="mr-2" />
                      )}
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ================== COMMENT COMPONENT ==================
function CommentItem({ 
  comment, 
  onLike 
}: { 
  comment: Comment; 
  onLike: (commentId: string) => void;
}) {
  const currentUser = getCurrentUser();
  const isLiked = comment.likedBy.includes(currentUser?.id || '');

  return (
    <div className="flex gap-2 py-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs flex-shrink-0">
        {comment.author.displayName[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-slate-800/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white text-sm">{comment.author.displayName}</span>
            {comment.author.isVerified && <span className="text-blue-400 text-xs">✓</span>}
            <span className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-300">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-2">
          <button
            onClick={() => onLike(comment.id)}
            className={`text-xs flex items-center gap-1 ${isLiked ? 'text-pink-400' : 'text-slate-500 hover:text-pink-400'}`}
          >
            <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} />
            {comment.likesCount > 0 && comment.likesCount}
          </button>
          <button className="text-xs text-slate-500 hover:text-white">Reply</button>
        </div>
      </div>
    </div>
  );
}

// ================== POST CARD ==================
function PostCard({ 
  post, 
  onLike, 
  onDelete,
  compact = false,
}: { 
  post: Post; 
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  compact?: boolean;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const currentUser = getCurrentUser();
  const isLiked = post.likedBy.includes(currentUser?.id || '');
  const isOwnPost = post.authorId === currentUser?.id;

  useEffect(() => {
    setIsFollowingAuthor(isFollowing(post.authorId));
  }, [post.authorId]);

  useEffect(() => {
    if (showComments) {
      const postComments = getComments(post.id);
      setComments(postComments);
    }
  }, [showComments, post.id]);

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment = addComment(post.id, commentInput);
    setComments([newComment, ...comments]);
    setCommentInput('');
    toast.success('Comment added!');
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId);
    setComments(getComments(post.id));
  };

  const handleShare = () => {
    sharePost(post.id);
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('Link copied!');
  };

  const handleFollow = () => {
    if (isFollowingAuthor) {
      unfollowUser(post.authorId);
      setIsFollowingAuthor(false);
      toast.success(`Unfollowed ${post.author.displayName}`);
    } else {
      followUser(post.authorId);
      setIsFollowingAuthor(true);
      toast.success(`Following ${post.author.displayName}`);
    }
  };

  const handleMessage = () => {
    try {
      startConversationWithUser(post.authorId);
      toast.success(`Started conversation with ${post.author.displayName}`);
    } catch {
      toast.error('Could not start conversation');
    }
  };

  return (
    <Card className={`bg-slate-900/80 border-slate-800 ${compact ? 'mb-2' : 'mb-4'}`}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              post.author.displayName[0].toUpperCase()
            )}
          </div>

          {/* Author info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white hover:underline cursor-pointer">
                {post.author.displayName}
              </span>
              {post.author.isVerified && (
                <span className="text-blue-400 text-sm">✓</span>
              )}
              <span className={`text-xs ${TIER_COLORS[post.author.membershipTier]}`}>
                {post.author.membershipTier.charAt(0).toUpperCase() + post.author.membershipTier.slice(1)}
              </span>
              {post.pinned && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <Pin size={10} />
                  Pinned
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>@{post.author.username}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
              {post.isEdited && <span>(edited)</span>}
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={18} />
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-1 z-10">
                {!isOwnPost && (
                  <>
                    <button
                      onClick={() => { handleFollow(); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                    >
                      {isFollowingAuthor ? 'Unfollow' : 'Follow'} @{post.author.username}
                    </button>
                    <button
                      onClick={() => { handleMessage(); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                    >
                      <MessageCircle size={14} /> Message
                    </button>
                  </>
                )}
                <button
                  onClick={() => { navigator.clipboard.writeText(post.content); toast.success('Copied!'); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Copy size={14} /> Copy text
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                  onClick={() => { toast.success('Bookmarked!'); setShowMenu(false); }}
                >
                  <Bookmark size={14} /> Bookmark
                </button>
                {isOwnPost ? (
                  <button
                    onClick={() => { onDelete(post.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete post
                  </button>
                ) : (
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
                    onClick={() => { toast.success('Reported!'); setShowMenu(false); }}
                  >
                    <Flag size={14} /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-slate-200 whitespace-pre-wrap">{post.content}</p>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  className="text-xs text-aura-400 hover:text-aura-300 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <div className={`grid gap-1 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.images.slice(0, 4).map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt="" 
                  className="w-full h-48 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? 'text-pink-400' : 'text-slate-400 hover:text-pink-400'
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{formatNumber(post.likesCount)}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-sm">{formatNumber(post.commentsCount)}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-slate-400 hover:text-green-400 transition-colors"
            >
              <Share2 size={18} />
              <span className="text-sm">{formatNumber(post.sharesCount)}</span>
            </button>
          </div>

          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-xs text-slate-500 hover:text-white flex items-center gap-1"
          >
            {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showComments ? 'Hide' : 'Show'} comments
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            {/* Comment input */}
            <div className="flex gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 flex gap-2">
                <Input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Write a comment..."
                  className="bg-slate-800/50 border-slate-700 h-8 text-sm"
                />
                <Button
                  onClick={handleAddComment}
                  size="icon"
                  className="h-8 w-8 bg-aura-600 hover:bg-aura-700"
                  disabled={!commentInput.trim()}
                >
                  <Send size={14} />
                </Button>
              </div>
            </div>

            {/* Comment list */}
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onLike={handleLikeComment}
                  />
                ))
              ) : (
                <p className="text-center text-sm text-slate-500 py-4">
                  No comments yet. Be the first to comment! 💬
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ================== MAIN SOCIAL FEED ==================
export function SocialFeed({
  userId,
  tag,
  showComposer = true,
  limit,
  compact = false,
  className = '',
}: SocialFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(() => {
    const fetchedPosts = getPosts({ authorId: userId, tag, limit });
    setPosts(fetchedPosts);
    setLoading(false);
    setRefreshing(false);
  }, [userId, tag, limit]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts.filter(p => !p.pinned), ...posts.filter(p => p.pinned)]);
  };

  const handleLike = (postId: string) => {
    likePost(postId);
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const currentUser = getCurrentUser();
        const isLiked = p.likedBy.includes(currentUser?.id || '');
        return {
          ...p,
          likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
          likedBy: isLiked 
            ? p.likedBy.filter(id => id !== currentUser?.id)
            : [...p.likedBy, currentUser?.id || ''],
        };
      }
      return p;
    }));
  };

  const handleDelete = (postId: string) => {
    deletePost(postId);
    setPosts(posts.filter(p => p.id !== postId));
    toast.success('Post deleted');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
    toast.success('Feed refreshed!');
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-slate-900/80 border-slate-800">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700 rounded w-32 mb-2" />
                    <div className="h-3 bg-slate-800 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-slate-700 rounded w-full mb-2" />
                <div className="h-4 bg-slate-700 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-aura-400" />
          <h2 className="text-lg font-semibold text-white">
            {tag ? `#${tag}` : userId ? 'Posts' : 'Social Feed'}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-slate-400 hover:text-white"
        >
          <Clock size={14} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Composer */}
      {showComposer && <PostComposer onPostCreated={handlePostCreated} />}

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              compact={compact}
            />
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-8 text-center">
            <Sparkles size={32} className="mx-auto mb-3 text-aura-400 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
            <p className="text-slate-400 text-sm">
              {userId ? "This user hasn't posted anything yet." : "Be the first to share something!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ================== EXPORT WALL COMPONENT ==================
export { PostCard, PostComposer };
