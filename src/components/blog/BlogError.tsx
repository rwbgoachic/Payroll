import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface BlogErrorProps {
  message: string;
  onRetry?: () => void;
}

const BlogError: React.FC<BlogErrorProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle size={48} className="text-error mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-gray-600 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-outline flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default BlogError;