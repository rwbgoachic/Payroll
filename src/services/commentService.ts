import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  status: 'published' | 'pending' | 'spam';
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

export class CommentService {
  /**
   * Get comments for a blog post
   */
  static async getComments(postId: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        *,
        user:users(
          id,
          email,
          user_metadata
        )
      `)
      .eq('post_id', postId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Add a new comment
   */
  static async addComment(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content,
        status: 'published'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Like a comment
   */
  static async likeComment(commentId: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .update({ likes: supabase.sql`likes + 1` })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Report a comment
   */
  static async reportComment(commentId: string, reason: string) {
    const { data, error } = await supabase
      .from('blog_comments')
      .update({ status: 'spam' })
      .eq('id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}