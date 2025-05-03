import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Image, Eye } from 'lucide-react';
import { BlogService } from '../../services/blogService';
import { renderMarkdown } from '../../utils/markdown';

interface BlogEditorProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    status?: 'draft' | 'published';
    scheduledFor?: Date;
  };
}

const BlogEditor: React.FC<BlogEditorProps> = ({ initialData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    tags: initialData?.tags || [],
    status: initialData?.status || 'draft',
    scheduledFor: initialData?.scheduledFor
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      if (initialData?.id) {
        await BlogService.updatePost(initialData.id, formData);
      } else {
        await BlogService.createPost(formData);
      }

      navigate('/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Post' : 'New Post'}
        </h1>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setPreview(!preview)}
          >
            <Eye size={16} className="mr-2" />
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            <Save size={16} className="mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {preview ? (
        <div className="prose max-w-none">
          <h1>{formData.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content) }} />
        </div>
      ) : (
        <form className="space-y-6">
          <div>
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              id="title"
              className="form-input"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="form-label">Excerpt</label>
            <textarea
              id="excerpt"
              rows={2}
              className="form-input"
              value={formData.excerpt}
              onChange={e => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="form-label">Content (Markdown)</label>
            <textarea
              id="content"
              rows={20}
              className="form-input font-mono"
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              className="form-input"
              value={formData.tags.join(', ')}
              onChange={handleTagChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                className="form-input"
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label htmlFor="scheduledFor" className="form-label">Schedule Publication</label>
              <input
                type="datetime-local"
                id="scheduledFor"
                className="form-input"
                value={formData.scheduledFor?.toISOString().slice(0, 16) || ''}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  scheduledFor: e.target.value ? new Date(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default BlogEditor;