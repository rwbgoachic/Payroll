import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface RelatedPost {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  tags: string[];
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  currentPostId: string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts, currentPostId }) => {
  const relatedPosts = posts
    .filter(post => post.id !== currentPostId)
    .slice(0, 3);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.id}`}
            className="block group"
          >
            <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="text-xs text-gray-500">
                  {format(post.publishedAt, 'MMM d, yyyy')}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;