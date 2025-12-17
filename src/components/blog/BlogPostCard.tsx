import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BlogPost } from '../../types';
import { formatDate, estimateReadingTime, formatViewCount } from '../../utils/blogHelpers';
import { scaleVariants, getAnimationConfig } from '../../utils/deviceDetection';

interface BlogPostCardProps {
  post: BlogPost;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const animConfig = getAnimationConfig();
  const readingTime = estimateReadingTime(post.content);

  return (
    <motion.div
      {...scaleVariants}
      transition={{ duration: animConfig.duration }}
      whileHover={{ scale: animConfig.duration > 0 ? 1.02 : 1 }}
      className="group"
    >
      <Link
        to={`/blog/${post.slug}`}
        className="block rounded-xl overflow-hidden bg-[var(--color-card)] border border-[var(--color-header)] hover:border-teal-500/50 transition-colors h-full"
      >
        {/* Featured Image */}
        <div className="relative h-48 bg-slate-800 overflow-hidden">
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-900/40 to-amber-900/40">
              <Tag className="text-teal-400/30" size={64} />
            </div>
          )}
          {/* Reading Time Badge */}
          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-xs text-teal-300">
            <Clock size={12} style={{ width: '12px', height: '12px', color: 'currentColor' }} />
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Tags */}
          {post.tags_list.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags_list.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-900/30 text-teal-300 text-xs"
                >
                  <Tag size={10} style={{ width: '10px', height: '10px', color: 'currentColor' }} />
                  {tag}
                </span>
              ))}
              {post.tags_list.length > 3 && (
                <span className="text-xs text-slate-400">+{post.tags_list.length - 3} more</span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors line-clamp-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-300 mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <User size={14} style={{ width: '14px', height: '14px', color: 'currentColor' }} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} style={{ width: '14px', height: '14px', color: 'currentColor' }} />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye size={14} style={{ width: '14px', height: '14px', color: 'currentColor' }} />
              <span>{formatViewCount(post.view_count)} views</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};