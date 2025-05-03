import React from 'react';

const BlogSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="text-center">
          <div className="h-10 bg-gray-200 rounded-lg w-3/4 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>

        {/* Search and Filter Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="h-10 bg-gray-200 rounded w-64"></div>
          <div className="flex space-x-2">
            <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* Blog Posts Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="mt-4 flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSkeleton;