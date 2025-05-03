import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BlogService } from '../services/blogService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            {
              id: '1',
              title: 'Test Post',
              content: 'Test Content',
              excerpt: 'Test Excerpt',
              author: 'Test Author',
              published_at: new Date().toISOString(),
              tags: ['test'],
              source: 'Test Source',
              source_url: 'http://test.com'
            }
          ],
          error: null
        }))
      }))
    }))
  }
}));

describe('BlogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch blog posts', async () => {
    const posts = await BlogService.getBlogPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Test Post');
  });

  it('should get a single blog post', async () => {
    const post = await BlogService.getBlogPost('1');
    expect(post.title).toBe('Test Post');
  });

  it('should get related posts', async () => {
    const posts = await BlogService.getRelatedPosts('1', ['test']);
    expect(posts).toHaveLength(1);
  });

  it('should search posts', async () => {
    const posts = await BlogService.searchPosts('test');
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe('Test Post');
  });
});