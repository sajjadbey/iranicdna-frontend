import React, { useEffect, useState, useMemo } from 'react';
import { Users, Dna, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { TreeDiagram } from '../components/communities/TreeDiagram';
import { TribeDetailModal } from '../components/communities/TribeDetailModal';
import type { Tribe, Clan } from '../types';

const API_BASE = 'http://127.0.0.1:8000/genetics';

export const CommunitiesPage: React.FC = () => {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch tribes and clans
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [tribesRes, clansRes] = await Promise.all([
          fetch(`${API_BASE}/tribes/`),
          fetch(`${API_BASE}/clans/`),
        ]);

        if (!tribesRes.ok || !clansRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const tribesData: Tribe[] = await tribesRes.json();
        const clansData: Clan[] = await clansRes.json();

        setTribes(tribesData || []);
        setClans(clansData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load communities');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group clans by tribe
  const clansByTribe = useMemo(() => {
    const grouped: Record<string, Clan[]> = {};
    clans.forEach((clan) => {
      if (!grouped[clan.tribe]) {
        grouped[clan.tribe] = [];
      }
      grouped[clan.tribe].push(clan);
    });
    return grouped;
  }, [clans]);


  const handleTribeClick = (tribe: Tribe) => {
    setSelectedTribe(tribe);
    setSelectedClan(null);
    setIsModalOpen(true);
  };

  const handleClanClick = (clan: Clan) => {
    setSelectedClan(clan);
    setSelectedTribe(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedTribe(null);
      setSelectedClan(null);
    }, 300);
  };

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="max-w-xl text-center p-6 bg-slate-800/50 rounded-xl">
            <h2 className="text-2xl font-bold mb-2 text-red-400">Data Error</h2>
            <p className="text-sm text-teal-300">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Dna className="mx-auto mb-4 text-teal-400" size={48} />
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-teal-200"
              >
                Loading communities...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-16 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="text-center relative">
          {/* Ornamental top decoration */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-teal-500 to-teal-600" />
            <Sparkles className="text-teal-500" size={24} />
            <div className="h-px w-24 bg-gradient-to-l from-transparent via-teal-500 to-teal-600" />
          </motion.div>

          {/* Main icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 12 }}
            className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700 mb-8 shadow-2xl shadow-teal-900/50 border-4 border-teal-500/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <Crown className="text-teal-100 relative z-10" size={56} />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold mb-6 relative"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
              Iranian Tribes
            </span>
            <br />
            <span className="text-3xl md:text-5xl bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              & Their Clans
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-teal-200/90 max-w-3xl mx-auto leading-relaxed mb-8"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Journey through centuries of heritage and discover the rich tapestry of Iranian tribal lineages, 
            where ancient traditions meet modern understanding
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex items-center justify-center gap-8 flex-wrap"
          >
            <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border-2 border-teal-600/30 backdrop-blur-sm">
              <div className="text-3xl font-bold text-teal-300" style={{ fontFamily: 'Cinzel, serif' }}>
                {tribes.length}
              </div>
              <div className="text-sm text-teal-400/80" style={{ fontFamily: 'Lato, sans-serif' }}>
                Tribes
              </div>
            </div>
            <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border-2 border-teal-600/30 backdrop-blur-sm">
              <div className="text-3xl font-bold text-teal-300" style={{ fontFamily: 'Cinzel, serif' }}>
                {clans.length}
              </div>
              <div className="text-sm text-teal-400/80" style={{ fontFamily: 'Lato, sans-serif' }}>
                Clans
              </div>
            </div>
          </motion.div>

          {/* Ornamental bottom decoration */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-teal-500/50 to-teal-600/50" />
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <div className="h-px w-32 bg-gradient-to-l from-transparent via-teal-500/50 to-teal-600/50" />
          </motion.div>
        </div>
      </motion.section>

      {/* Tree Diagram */}
      {!loading && tribes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30"
        >
          <Users className="mx-auto mb-3 text-teal-500" size={48} />
          <p className="text-teal-400">No tribes or clans data available.</p>
        </motion.div>
      )}

      {!loading && tribes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.15) 0%, rgba(6, 78, 59, 0.2) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(20, 184, 166, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(20, 184, 166, 0.25), inset 0 2px 4px rgba(94, 234, 212, 0.1)'
          }}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-teal-500/40 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-teal-500/40 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-teal-500/40 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-teal-500/40 rounded-br-3xl" />
          <TreeDiagram
            tribes={tribes}
            clansByTribe={clansByTribe}
            onTribeClick={handleTribeClick}
            onClanClick={handleClanClick}
          />
        </motion.div>
      )}

      {/* Detail Modal */}
      <TribeDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tribe={selectedTribe}
        clan={selectedClan}
        apiBase={API_BASE}
      />
    </Layout>
  );
};