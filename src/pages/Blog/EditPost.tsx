import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BlogEditor from '../../components/blog/BlogEditor';
import { BlogService } from '../../services/blogService';
import BlogError from '../../components/blog/BlogError';
import BlogSkeleton from '../../components/blog/BlogSkeleton';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await BlogService.getBlogPost(id!);
      setPost(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post');
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
        <title>Edit: {post.title} | PaySurity</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <BlogEditor initialData={post} />
      </div>
    </>
  );
};

export default EditPost;