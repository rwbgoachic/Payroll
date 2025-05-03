import React from 'react';
import { Calendar, Clock, Tag, User } from 'lucide-react';
import { format } from 'date-fns';
import ShareButtons from './ShareButtons';

interface BlogContentProps {
  title: string;
  content: string;
  author: string;
  publishedAt: Date;
  tags: string[];
  readTime: number;
  url: string;
}

const BlogContent: React.FC<BlogContentProps> = ({
  title,
  content,
  author,
  publishedAt,
  tags,
  readTime,
  url
}) => {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
          <div className="flex items-center">
            <User size={16} className="mr-1" />
            {author}
          </div>
          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            {format(publishedAt, 'MMMM d, yyyy')}
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1" />
            {readTime} min read
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map(tag => (
            <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
              <Tag size={14} className="inline-block mr-1" />
              {tag}
            </span>
          ))}
        </div>
        
        <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: content }} />
        
        <div className="border-t border-gray-200 pt-6 mt-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Share this article
            </div>
            <ShareButtons url={url} title={title} />
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogContent;