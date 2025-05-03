import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  published_at: string;
  tags: string[];
  source?: string;
  source_url?: string;
  status: 'draft' | 'published';
  scheduled_for?: string;
}

export class BlogService {
  /**
   * Get all blog posts
   */
  static async getBlogPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get all posts (including drafts) for admin
   */
  static async getAllPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a single blog post by ID
   */
  static async getBlogPost(id: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new blog post
   */
  static async createPost(post: Omit<BlogPost, 'id' | 'published_at'>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...post,
        published_at: post.status === 'published' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an existing blog post
   */
  static async updatePost(id: string, updates: Partial<BlogPost>) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...updates,
        published_at: updates.status === 'published' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a blog post
   */
  static async deletePost(id: string) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Get related posts based on tags
   */
  static async getRelatedPosts(currentPostId: string, tags: string[]) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .neq('id', currentPostId)
      .eq('status', 'published')
      .contains('tags', tags)
      .order('published_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    return data;
  }

  /**
   * Search posts
   */
  static async searchPosts(query: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get posts by tag
   */
  static async getPostsByTag(tag: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .contains('tags', [tag])
      .order('published_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}