import React, { useEffect, useState, useMemo } from 'react';
import { Users, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { FolderTree } from '../components/communities/FolderTree';
import { TribeDetailModal } from '../components/communities/TribeDetailModal';
import { AboutContribute } from '../components/AboutContribute';
import { graphqlService } from '../services/graphqlService';
import { ANALYTICS_API_URL } from '../config/api';
import type { Tribe, Clan } from '../types';

interface CountryHierarchy {
  country: string;
  tribes: {
    tribe: Tribe;
    clans: Clan[];
  }[];
}

export const CommunitiesPage: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<CountryHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTribe, setSelectedTribe] = useState<Tribe | null>(null);
  const [selectedClan, setSelectedClan] = useState<Clan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await graphqlService.fetchCommunitiesHierarchy();
        
        setHierarchy(data.map(item => ({
          country: item.country,
          tribes: item.tribes.map(t => ({
            tribe: {
              name: t.tribe.name,
              ethnicities: t.tribe.ethnicities,
              historical_note: t.tribe.historicalNote,
              sample_count: t.tribe.sampleCount,
            },
            clans: t.clans.map(c => ({
              name: c.name,
              tribes: c.tribes,
              common_ancestor: c.commonAncestor,
              sample_count: c.sampleCount,
            })),
          })),
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load communities');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totals = useMemo(() => {
    let totalTribes = 0;
    let totalClans = 0;

    hierarchy.forEach((country) => {
      totalTribes += country.tribes.length;
      country.tribes.forEach((tribeData) => {
        totalClans += tribeData.clans.length;
      });
    });

    return { totalTribes, totalClans, totalCountries: hierarchy.length };
  }, [hierarchy]);

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
              Explore communities organized by country, tribe, and clan hierarchy.
            </p>
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border-2 border-teal-600/30 backdrop-blur-sm">
              <div className="text-2xl font-bold text-teal-300">
                {totals.totalTribes}
              </div>
              <div className="text-xs text-teal-400/80">
                Tribes
              </div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-teal-900/40 to-cyan-900/40 border-2 border-teal-600/30 backdrop-blur-sm">
              <div className="text-2xl font-bold text-teal-300">
                {totals.totalClans}
              </div>
              <div className="text-xs text-teal-400/80">
                Clans
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        {!loading && hierarchy.length === 0 ? (
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
              No communities data available.
            </motion.p>
          </motion.div>
        ) : (
          !loading && hierarchy.length > 0 && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <FolderTree
                hierarchy={hierarchy}
                onTribeClick={handleTribeClick}
                onClanClick={handleClanClick}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>

      <TribeDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tribe={selectedTribe}
        clan={selectedClan}
        apiBase={ANALYTICS_API_URL}
      />

      <AboutContribute />
    </Layout>
  );
};
