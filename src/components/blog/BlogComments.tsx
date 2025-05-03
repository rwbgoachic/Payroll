import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CommentService } from '../../services/commentService';

interface Comment {
  id: string;
  content: string;
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  likes: number;
}

interface BlogCommentsProps {
  postId: string;
}

const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      const comment = await CommentService.addComment(postId, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      setError('Please sign in to like comments');
      return;
    }

    try {
      await CommentService.likeComment(commentId);
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like comment');
    }
  };

  const handleReport = async (commentId: string) => {
    if (!user) {
      setError('Please sign in to report comments');
      return;
    }

    if (window.confirm('Are you sure you want to report this comment?')) {
      try {
        await CommentService.reportComment(commentId, 'inappropriate');
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to report comment');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <MessageSquare size={20} className="text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">
          Comments ({comments.length})
        </h3>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="form-input min-h-[100px]"
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600">Please sign in to comment</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {comment.user.avatar ? (
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {comment.user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {comment.user.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{comment.content}</p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary"
              >
                <ThumbsUp size={16} />
                <span>{comment.likes}</span>
              </button>
              <button
                onClick={() => handleReport(comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-error"
              >
                <Flag size={16} />
                <span>Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogComments;