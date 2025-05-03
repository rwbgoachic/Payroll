import React from 'react';

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTag, onTagSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagSelect(null)}
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          !selectedTag
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All
      </button>
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => onTagSelect(tag)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedTag === tag
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default TagFilter;