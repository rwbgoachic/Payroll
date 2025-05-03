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
      })),
      upsert: vi.fn(() => ({ error: null }))
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

  it('should save news posts', async () => {
    const posts = [{
      id: '1',
      title: 'Test Post',
      content: 'Test Content',
      excerpt: 'Test Excerpt',
      author: 'Test Author',
      publishedAt: new Date(),
      tags: ['test'],
      source: 'Test Source',
      sourceUrl: 'http://test.com'
    }];

    await expect(BlogService.saveNewsPosts(posts)).resolves.not.toThrow();
  });
});