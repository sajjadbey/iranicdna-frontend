import React from 'react';
import { Search, Tag, X } from 'lucide-react';

interface BlogPostFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  availableTags: string[];
}

export const BlogPostFilters: React.FC<BlogPostFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  availableTags,
}) => {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" 
          size={20}
          style={{ width: '20px', height: '20px', color: 'currentColor' }}
        />
        <input
          type="text"
          placeholder="Search blog posts..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--color-card)] border border-[var(--color-header)] text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X size={20} style={{ width: '20px', height: '20px', color: 'currentColor' }} />
          </button>
        )}
      </div>

      {/* Tag Filter Pills */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTagChange(null)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTag === null
                ? 'bg-teal-600 text-white'
                : 'bg-[var(--color-card)] text-slate-300 border border-[var(--color-header)] hover:border-teal-500/50'
            }`}
          >
            <Tag size={14} style={{ width: '14px', height: '14px', color: 'currentColor' }} />
            All Tags
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-teal-600 text-white'
                  : 'bg-[var(--color-card)] text-slate-300 border border-[var(--color-header)] hover:border-teal-500/50'
              }`}
            >
              <Tag size={14} style={{ width: '14px', height: '14px', color: 'currentColor' }} />
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};