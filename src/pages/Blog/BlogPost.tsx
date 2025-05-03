import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { BlogService } from '../../services/blogService';
import { trackPageView, trackBlogView } from '../../utils/analytics';
import { renderMarkdown } from '../../utils/markdown';
import BlogContent from '../../components/blog/BlogContent';
import RelatedPosts from '../../components/blog/RelatedPosts';
import BlogAuthor from '../../components/blog/BlogAuthor';
import ShareButtons from '../../components/blog/ShareButtons';
import NewsletterSignup from '../../components/blog/NewsletterSignup';
import BlogComments from '../../components/blog/BlogComments';
import BlogSkeleton from '../../components/blog/BlogSkeleton';
import BlogError from '../../components/blog/BlogError';

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadPost();
      trackPageView(`/blog/${id}`);
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError('');

      const [postData, relatedData] = await Promise.all([
        BlogService.getBlogPost(id!),
        BlogService.getRelatedPosts(id!, ['payroll', 'tax compliance'])
      ]);

      const processedPost = {
        ...postData,
        publishedAt: new Date(postData.published_at),
        readTime: Math.ceil(postData.content.split(' ').length / 200),
        renderedContent: renderMarkdown(postData.content)
      };

      setPost(processedPost);
      setRelatedPosts(relatedData.map(post => ({
        ...post,
        publishedAt: new Date(post.published_at)
      })));

      // Track blog view
      trackBlogView(postData.id, postData.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BlogSkeleton />;
  }

  if (error || !post) {
    return (
      <BlogError 
        message={error || 'Post not found'} 
        onRetry={loadPost}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | PaySurity Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.publishedAt.toISOString()} />
        <meta property="article:author" content={post.author} />
        {post.tags.map((tag: string) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Link
              to="/blog"
              className="inline-flex items-center text-primary hover:text-primary-dark mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Blog
            </Link>

            <BlogContent
              title={post.title}
              content={post.renderedContent}
              author={post.author}
              publishedAt={post.publishedAt}
              tags={post.tags}
              readTime={post.readTime}
              url={window.location.href}
            />

            <div className="mt-12">
              <BlogAuthor
                author={{
                  id: '1',
                  name: post.author,
                  role: 'Content Writer',
                  bio: 'Expert in payroll and tax compliance with over 10 years of experience.',
                  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
                  twitter: 'https://twitter.com/paysurity',
                  linkedin: 'https://linkedin.com/company/paysurity'
                }}
              />
            </div>

            <div className="mt-12">
              <BlogComments postId={post.id} />
            </div>
          </div>

          <div className="space-y-8">
            <div className="sticky top-8">
              <ShareButtons url={window.location.href} title={post.title} />
              <div className="mt-8">
                <NewsletterSignup />
              </div>
            </div>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <RelatedPosts posts={relatedPosts} currentPostId={post.id} />
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPost;