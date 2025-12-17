import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Eye, Clock, Tag, AlertCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import type { BlogPost } from '../types';
import { fetchBlogPostBySlug, formatDate, estimateReadingTime, formatViewCount } from '../utils/blogHelpers';
import { fadeInVariants, slideInVariants, getAnimationConfig } from '../utils/deviceDetection';

export const BlogPostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const animConfig = getAnimationConfig();

  useEffect(() => {
    let mounted = true;

    const loadPost = async () => {
      if (!slug) {
        setError('No blog post slug provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchBlogPostBySlug(slug);

        if (mounted) {
          setPost(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load blog post');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <AnimatePresence mode="wait">
          <motion.div
            key="loading"
            {...fadeInVariants}
            transition={{ duration: animConfig.duration }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <BookOpen className="mx-auto mb-4 text-teal-400" size={48} />
              </motion.div>
              <div className="text-lg text-teal-200">Loading blog post...</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-xl text-center p-6 bg-slate-800/50 rounded-xl">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <h2 className="text-2xl font-bold mb-2 text-red-400">Blog Post Not Found</h2>
            <p className="text-sm text-teal-300 mb-6">{error || 'The requested blog post could not be found'}</p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
            >
              <ArrowLeft size={20} style={{ width: '20px', height: '20px', color: 'currentColor' }} />
              Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const readingTime = estimateReadingTime(post.content);

  return (
    <Layout>
      <motion.div
        {...slideInVariants}
        transition={{ duration: animConfig.duration }}
      >
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 mb-6 text-teal-300 hover:text-teal-200 transition-colors"
        >
          <ArrowLeft size={20} style={{ width: '20px', height: '20px', color: 'currentColor' }} />
          <span>Back to Blog</span>
        </Link>

        {/* Featured Image */}
        {post.featured_image && (
          <motion.div
            {...fadeInVariants}
            transition={{ duration: animConfig.duration, delay: 0.1 }}
            className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8"
          >
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          </motion.div>
        )}

        {/* Article Header */}
        <motion.article
          {...fadeInVariants}
          transition={{ duration: animConfig.duration, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Tags */}
          {post.tags_list.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags_list.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-teal-900/30 text-teal-300 text-sm hover:bg-teal-900/50 transition-colors"
                >
                  <Tag size={12} style={{ width: '12px', height: '12px', color: 'currentColor' }} />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 pb-6 mb-8 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <User size={16} style={{ width: '16px', height: '16px', color: 'currentColor' }} />
              <span>By {post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ width: '16px', height: '16px', color: 'currentColor' }} />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ width: '16px', height: '16px', color: 'currentColor' }} />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} style={{ width: '16px', height: '16px', color: 'currentColor' }} />
              <span>{formatViewCount(post.view_count)} views</span>
            </div>
          </div>

          {/* Content */}
          <div 
            className="prose prose-invert prose-teal max-w-none prose-headings:font-bold prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-a:text-teal-400 prose-a:no-underline hover:prose-a:text-teal-300 prose-strong:text-white prose-code:text-teal-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-img:rounded-lg prose-blockquote:border-l-4 prose-blockquote:border-teal-500 prose-blockquote:text-slate-400 prose-ul:text-slate-300 prose-ol:text-slate-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-700">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
            >
              <ArrowLeft size={20} style={{ width: '20px', height: '20px', color: 'currentColor' }} />
              Back to Blog
            </Link>
          </div>
        </motion.article>
      </motion.div>
    </Layout>
  );
};