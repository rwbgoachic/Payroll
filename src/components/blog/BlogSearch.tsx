import React from 'react';
import { Search } from 'lucide-react';

interface BlogSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const BlogSearch: React.FC<BlogSearchProps> = ({ value, onChange }) => {
  return (
    <div className="relative flex-grow max-w-lg">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={16} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search blog posts..."
        className="form-input pl-9 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default BlogSearch;