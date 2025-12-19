import React, { useEffect, useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { BlogPostCard } from '../components/blog/BlogPostCard';
import { BlogPostFilters } from '../components/blog/BlogPostFilters';
import { DNABackground } from '../components/DNABackground';
import { dnaBackgroundConfig, mobileDnaBackgroundConfig } from '../config/dnaBackgroundConfig';
import type { BlogPost } from '../types';
import { fetchBlogPosts } from '../utils/blogHelpers';
import { fadeInVariants, slideInVariants, getAnimationConfig, isMobileDevice } from '../utils/deviceDetection';

export const BlogPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const animConfig = getAnimationConfig();

  // Fetch blog posts
  useEffect(() => {
    let mounted = true;

    const loadPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: { tag?: string; search?: string } = {};
        if (selectedTag) params.tag = selectedTag;
        if (searchQuery) params.search = searchQuery;

        const data = await fetchBlogPosts(params);

        if (mounted) {
          // Ensure data is an array
          setPosts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load blog posts');
          setPosts([]); // Set empty array on error to prevent forEach errors
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      mounted = false;
    };
  }, [selectedTag, searchQuery]);

  // Extract all unique tags from posts
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    // Ensure posts is an array before iterating
    if (Array.isArray(posts)) {
      posts.forEach((post) => {
        if (post.tags_list && Array.isArray(post.tags_list)) {
          post.tags_list.forEach((tag) => tagsSet.add(tag));
        }
      });
    }
    return Array.from(tagsSet).sort();
  }, [posts]);


  const backgroundConfig = useMemo(() => {
    const isMobile = isMobileDevice();
    return isMobile 
      ? { ...dnaBackgroundConfig, ...mobileDnaBackgroundConfig }
      : dnaBackgroundConfig;
  }, []);

  return (
    <Layout>
      <DNABackground {...backgroundConfig} />
      <AnimatePresence mode="wait">
        {loading && (
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
              <div className="text-lg text-teal-200">Loading blog posts...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.section
        {...slideInVariants}
        transition={{ duration: animConfig.duration }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-teal-400" size={36} style={{ width: '36px', height: '36px', color: 'currentColor' }} />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
            Blog Posts
          </h1>
        </div>
        <p className="text-teal-300/80 mb-6">
          Explore articles about genetics, haplogroups, and Iranian heritage
        </p>

        {/* Filters */}
        <BlogPostFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          availableTags={availableTags}
        />
      </motion.section>

      {/* Blog Posts Grid */}
      <AnimatePresence mode="wait">
        {!loading && (posts.length === 0 || error) ? (
          <motion.div
            key="no-posts"
            {...fadeInVariants}
            transition={{ duration: animConfig.duration }}
            className="rounded-2xl p-12 bg-slate-800/60 text-center border border-teal-700/30"
          >
            <BookOpen className="mx-auto mb-4 text-teal-500" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">No blog posts found</h3>
            <p className="text-slate-400">
              {error
                ? 'Unable to load blog posts at this time. Please try again later.'
                : searchQuery || selectedTag
                ? 'Try adjusting your search or filters'
                : 'No blog posts are currently available'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="posts-grid"
            {...fadeInVariants}
            transition={{ duration: animConfig.duration }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};