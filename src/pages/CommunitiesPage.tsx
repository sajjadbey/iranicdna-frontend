import React, { useEffect, useState, useMemo } from 'react';
import { Users, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { FolderTree } from '../components/communities/FolderTree';
import { TribeDetailModal } from '../components/communities/TribeDetailModal';
import type { Tribe, Clan } from '../types';

const API_BASE = 'https://qizilbash.ir/genetics';

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

      {/* Header Section - Similar to Analytics */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              Communities
            </h2>
            <p className="mt-3 text-teal-300/80">
              Explore Iranian tribes and their clans through an organized hierarchical structure.
            </p>
          </div>
          <div className="flex items-center justify-end gap-8">
            <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border-2 border-teal-600/30 backdrop-blur-sm">
              <div className="text-2xl font-bold text-teal-300">
                {tribes.length}
              </div>
              <div className="text-xs text-teal-400/80">
                Tribes
              </div>
            </div>
            <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border-2 border-teal-600/30 backdrop-blur-sm">
              <div className="text-2xl font-bold text-teal-300">
                {clans.length}
              </div>
              <div className="text-xs text-teal-400/80">
                Clans
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!loading && tribes.length === 0 ? (
          <motion.div
            key="no-data"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-8 bg-slate-800/60 text-center border border-teal-700/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Users className="mx-auto mb-3 text-teal-500" size={48} />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-teal-400"
            >
              No tribes or clans data available.
            </motion.p>
          </motion.div>
        ) : (
          !loading && tribes.length > 0 && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <FolderTree
                tribes={tribes}
                clansByTribe={clansByTribe}
                onTribeClick={handleTribeClick}
                onClanClick={handleClanClick}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

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