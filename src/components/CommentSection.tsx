import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Reply, MoreHorizontal, Loader2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  IComment, 
  getCommentsByPost, 
  createComment, 
  likeComment, 
  deleteComment,
  getReplies 
} from '../services/commentService';

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
  onCommentCountChange?: (count: number) => void;
}

interface CommentItemProps {
  comment: IComment;
  currentUserId?: string;
  postId: string;
  onReply: (commentId: string, authorName: string) => void;
  onDelete: (commentId: string) => void;
  isReply?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  currentUserId, 
  postId,
  onReply, 
  onDelete,
  isReply = false 
}) => {
  const [liked, setLiked] = useState(currentUserId ? comment.likes.includes(currentUserId) : false);
  const [likesCount, setLikesCount] = useState(comment.likesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<IComment[]>(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    // Optimistic update
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    
    setIsLiking(true);
    try {
      const response = await likeComment(comment._id);
      setLiked(response.liked);
      setLikesCount(response.likesCount);
    } catch (error) {
      // Revert on error
      setLiked(liked);
      setLikesCount(likesCount);
      console.error('Error liking comment:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleLoadReplies = async () => {
    if (loadingReplies) return;
    
    setLoadingReplies(true);
    try {
      const response = await getReplies(comment._id);
      setReplies(response.replies);
      setShowReplies(true);
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  const isAuthor = currentUserId === comment.author._id;
  const navigate = useNavigate();

  return (
    <div className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : 'mt-4'}`}>
      <div 
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate(`/user/${comment.author._id}`)}
      >
        {comment.author.avatar ? (
          <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
        ) : (
          <span>{comment.author.name[0].toUpperCase()}</span>
        )}
      </div>
      
      <div className="flex-1">
        <div className="bg-gray-800 rounded-2xl px-4 py-2 inline-block max-w-full">
          <div className="flex items-center gap-2">
            <span 
              className="font-medium text-white text-sm cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => navigate(`/user/${comment.author._id}`)}
            >{comment.author.name}</span>
            <span className="text-gray-500 text-xs">{formatTime(comment.createdAt)}</span>
          </div>
          <p className="text-gray-300 text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-4 mt-1 ml-2">
          <button 
            onClick={handleLike}
            disabled={isLiking || !currentUserId}
            className={`flex items-center gap-1 text-xs hover:text-purple-400 transition-colors ${liked ? 'text-red-500' : 'text-gray-400'}`}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            <span>{likesCount > 0 ? likesCount : ''} Thích</span>
          </button>
          
          {!isReply && (
            <button 
              onClick={() => onReply(comment._id, comment.author.name)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Reply size={14} />
              <span>Trả lời</span>
            </button>
          )}
          
          {isAuthor && (
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MoreHorizontal size={14} />
              </button>
              
              {showMenu && (
                <div className="absolute left-0 top-5 bg-gray-800 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                  <button 
                    onClick={() => {
                      onDelete(comment._id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Replies section */}
        {!isReply && (replies.length > 0 || (comment.replies && comment.replies.length > 0)) && (
          <div className="mt-2">
            {!showReplies ? (
              <button 
                onClick={handleLoadReplies}
                disabled={loadingReplies}
                className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 ml-2"
              >
                {loadingReplies ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ChevronDown size={14} />
                )}
                <span>Xem {comment.replies?.length || replies.length} phản hồi</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setShowReplies(false)}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 ml-2 mb-2"
                >
                  <ChevronUp size={14} />
                  <span>Ẩn phản hồi</span>
                </button>
                {replies.map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    currentUserId={currentUserId}
                    postId={postId}
                    onReply={onReply}
                    onDelete={onDelete}
                    isReply={true}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId, currentUserId, onCommentCountChange }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = async (pageNum: number, append: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await getCommentsByPost(postId, pageNum, 5);
      if (append) {
        setComments(prev => [...prev, ...response.comments]);
      } else {
        setComments(response.comments);
      }
      setHasMore(pageNum < response.pagination.totalPages);
      setTotalComments(response.pagination.total);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [postId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await createComment(
        postId, 
        newComment.trim(),
        replyTo?.id
      );
      
      if (replyTo) {
        // Add reply to parent comment
        setComments(prev => prev.map(c => {
          if (c._id === replyTo.id) {
            return {
              ...c,
              replies: [...(c.replies || []), response.comment],
            };
          }
          return c;
        }));
      } else {
        // Add new comment at the top
        setComments(prev => [response.comment, ...prev]);
      }
      
      setNewComment('');
      setReplyTo(null);
      setTotalComments(prev => prev + 1);
      
      if (onCommentCountChange) {
        onCommentCountChange(totalComments + 1);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyTo({ id: commentId, name: authorName });
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      setTotalComments(prev => Math.max(0, prev - 1));
      
      if (onCommentCountChange) {
        onCommentCountChange(Math.max(0, totalComments - 1));
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
    }
  };

  return (
    <div className="border-t border-gray-800 px-4 py-3">
      {/* Comment Input */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-sm">
              <span className="text-gray-400">Đang trả lời</span>
              <span className="text-purple-400">{replyTo.name}</span>
              <button 
                onClick={() => setReplyTo(null)}
                className="text-gray-500 hover:text-white"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyTo ? `Trả lời ${replyTo.name}...` : "Viết bình luận..."}
              className="flex-1 bg-gray-800 text-white placeholder-gray-500 px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={isSubmitting}
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading && comments.length === 0 ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Chưa có bình luận nào</p>
      ) : (
        <>
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              currentUserId={currentUserId}
              postId={postId}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
          
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="mt-4 text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ChevronDown size={14} />
              )}
              <span>Xem thêm bình luận</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;
