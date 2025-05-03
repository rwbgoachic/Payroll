import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import { format } from 'date-fns';

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    publishedAt: Date;
    tags: string[];
    readTime: number;
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/blog/${post.id}`} className="block">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Tag size={14} />
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {post.title}
          </h2>

          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User size={14} className="mr-1" />
                {post.author}
              </div>
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {format(post.publishedAt, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              {post.readTime} min read
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default BlogCard;