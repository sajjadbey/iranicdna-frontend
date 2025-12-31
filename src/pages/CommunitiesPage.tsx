import React, { useEffect, useState, useMemo } from 'react';
import { Users, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout';
import { FolderTree } from '../components/communities/FolderTree';
import { TribeDetailModal } from '../components/communities/TribeDetailModal';
import { AboutContribute } from '../components/AboutContribute';
import { API_ENDPOINTS, ANALYTICS_API_URL } from '../config/api';
import type { Tribe, Clan, Sample } from '../types';
import { cachedFetch } from '../utils/apiCache';

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

  // Fetch and organize data by Country -> Tribe -> Clan
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [samplesData, tribesData, clansData] = await Promise.all([
          cachedFetch<Sample[]>(API_ENDPOINTS.samples),
          cachedFetch<Tribe[]>(API_ENDPOINTS.tribes),
          cachedFetch<Clan[]>(API_ENDPOINTS.clans),
        ]);

        // Create maps for quick lookup
        const tribesMap = new Map(tribesData.map(t => [t.name, t]));
        const clansMap = new Map(clansData.map(c => [c.name, c]));

        // Count samples for each entity
        const countrySampleCounts = new Map<string, number>();
        const tribeSampleCounts: Map<string, Map<string, number>> = new Map(); // country -> tribe -> count
        const clanSampleCounts: Map<string, Map<string, Map<string, number>>> = new Map(); // country -> tribe -> clan -> count

        // Process samples to build counts
        samplesData.forEach((sample) => {
          const country = sample.country || 'Unknown';
          const tribe = sample.tribe;
          const clan = sample.clan;
          const count = sample.count || 1;

          // Count by country
          countrySampleCounts.set(country, (countrySampleCounts.get(country) || 0) + count);

          // Count by country-tribe
          if (tribe) {
            if (!tribeSampleCounts.has(country)) {
              tribeSampleCounts.set(country, new Map());
            }
            const countryTribes = tribeSampleCounts.get(country)!;
            countryTribes.set(tribe, (countryTribes.get(tribe) || 0) + count);
          }

          // Count by country-tribe-clan
          if (tribe && clan) {
            if (!clanSampleCounts.has(country)) {
              clanSampleCounts.set(country, new Map());
            }
            const countryClans = clanSampleCounts.get(country)!;
            if (!countryClans.has(tribe)) {
              countryClans.set(tribe, new Map());
            }
            const tribeClans = countryClans.get(tribe)!;
            tribeClans.set(clan, (tribeClans.get(clan) || 0) + count);
          }
        });

        // Build hierarchy
        const hierarchyData: CountryHierarchy[] = [];

        // Sort countries alphabetically
        const countries = Array.from(tribeSampleCounts.keys()).sort();

        countries.forEach((country) => {
          const countryTribes: Map<string, number> = tribeSampleCounts.get(country) || new Map();
          const countryClans: Map<string, Map<string, number>> = clanSampleCounts.get(country) || new Map();

          const tribes: { tribe: Tribe; clans: Clan[] }[] = [];

          // Sort tribes by name
          const tribeNames = Array.from(countryTribes.keys()).sort();

          tribeNames.forEach((tribeName) => {
            const tribeData = tribesMap.get(tribeName);
            if (!tribeData) return;

            const tribeWithCount: Tribe = {
              ...tribeData,
              sample_count: countryTribes.get(tribeName) || 0,
            };

            const tribeClansMap: Map<string, number> = countryClans.get(tribeName) || new Map();
            const clans: Clan[] = [];

            // Sort clans by name
            const clanNames: string[] = Array.from(tribeClansMap.keys()).sort();

            clanNames.forEach((clanName) => {
              const clanData = clansMap.get(clanName);
              if (!clanData) return;

              const clanWithCount: Clan = {
                ...clanData,
                sample_count: tribeClansMap.get(clanName) || 0,
              };

              clans.push(clanWithCount);
            });

            tribes.push({
              tribe: tribeWithCount,
              clans,
            });
          });

          if (tribes.length > 0) {
            hierarchyData.push({
              country,
              tribes,
            });
          }
        });

        setHierarchy(hierarchyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load communities');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate totals
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

      {/* Header Section */}
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
                {totals.totalCountries}
              </div>
              <div className="text-xs text-teal-400/80">
                Countries
              </div>
            </div>
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

      {/* Main Content Area */}
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

      {/* Detail Modal */}
      <TribeDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tribe={selectedTribe}
        clan={selectedClan}
        apiBase={ANALYTICS_API_URL}
      />

      {/* About & Contribute Section */}
      <AboutContribute />
    </Layout>
  );
};