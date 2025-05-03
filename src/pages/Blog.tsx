import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import BlogCard from '../components/blog/BlogCard';
import BlogSearch from '../components/blog/BlogSearch';
import TagFilter from '../components/blog/TagFilter';
import { BlogService } from '../services/blogService';
import { trackPageView } from '../utils/analytics';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadBlogPosts();
    trackPageView('/blog');
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      setError('');

      const blogPosts = await BlogService.getBlogPosts();
      setPosts(blogPosts.map(post => ({
        ...post,
        publishedAt: new Date(post.published_at),
        readTime: Math.ceil(post.content.split(' ').length / 200)
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog | PaySurity - Modern Payroll Software</title>
        <meta name="description" content="Stay updated with the latest payroll trends, tax compliance updates, and best practices." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              PaySurity Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stay updated with the latest payroll trends, tax compliance updates, and best practices.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <BlogSearch value={searchTerm} onChange={setSearchTerm} />
            <TagFilter tags={allTags} selectedTag={selectedTag} onTagSelect={setSelectedTag} />
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No blog posts found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;