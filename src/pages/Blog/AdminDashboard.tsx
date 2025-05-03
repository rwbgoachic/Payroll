import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { BlogService } from '../../services/blogService';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await BlogService.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await BlogService.deletePost(id);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <Link to="/blog/new" className="btn btn-primary">
          <Plus size={16} className="mr-2" />
          New Post
        </Link>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="table-header">Title</th>
              <th className="table-header">Status</th>
              <th className="table-header">Published</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="table-cell">
                  <div className="font-medium text-gray-900">{post.title}</div>
                  <div className="text-sm text-gray-500">{post.excerpt}</div>
                </td>
                <td className="table-cell">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    post.status === 'published'
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="table-cell">
                  {post.published_at
                    ? format(new Date(post.published_at), 'MMM d, yyyy')
                    : '-'}
                </td>
                <td className="table-cell">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/blog/edit/${post.id}`}
                      className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1 text-gray-500 hover:text-error rounded-full hover:bg-gray-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;