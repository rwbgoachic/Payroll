import React from 'react';
import { Twitter, Linkedin, Globe } from 'lucide-react';

interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface BlogAuthorProps {
  author: Author;
}

const BlogAuthor: React.FC<BlogAuthorProps> = ({ author }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
      <img
        src={author.avatar}
        alt={author.name}
        className="h-16 w-16 rounded-full object-cover"
      />
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-900">{author.name}</h3>
        <p className="text-sm text-gray-500">{author.role}</p>
        <p className="text-sm text-gray-600 mt-2">{author.bio}</p>
        <div className="flex items-center space-x-4 mt-4">
          {author.twitter && (
            <a
              href={author.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Twitter size={18} />
            </a>
          )}
          {author.linkedin && (
            <a
              href={author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Linkedin size={18} />
            </a>
          )}
          {author.website && (
            <a
              href={author.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Globe size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogAuthor;