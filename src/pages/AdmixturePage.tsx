import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, AlertCircle, CheckCircle } from 'lucide-react';
import { Layout } from '../components/Layout';
import { VCFUploadForm } from '../components/vcf/VCFUploadForm';
import { AnalysisResultCard } from '../components/vcf/AnalysisResultCard';
import type { VCFAnalysisResponse } from '../types/vcf';
import { getAllAnalyses, getAnalysisById } from '../utils/vcfHelpers';
import { fadeInVariants, slideInVariants } from '../utils/deviceDetection';

export const AdmixturePage: React.FC = () => {
  const [analyses, setAnalyses] = useState<VCFAnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchAnalyses = useCallback(async () => {
    try {
      const data = await getAllAnalyses();
      // Ensure data is an array
      const analysesArray = Array.isArray(data) ? data : [];
      setAnalyses(analysesArray.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analyses');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  // Poll for updates on pending/processing analyses
  useEffect(() => {
    const pendingAnalyses = analyses.filter(
      a => a.status === 'pending' || a.status === 'processing'
    );

    if (pendingAnalyses.length === 0) return;

    const interval = setInterval(async () => {
      for (const analysis of pendingAnalyses) {
        try {
          const updated = await getAnalysisById(analysis.id);
          setAnalyses(prev =>
            prev.map(a => (a.id === updated.id ? updated : a))
          );
        } catch (err) {
          console.error(`Failed to update analysis ${analysis.id}:`, err);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [analyses]);

  const handleUploadSuccess = (analysis: VCFAnalysisResponse) => {
    setAnalyses(prev => [analysis, ...prev]);
    setSuccessMessage('File uploaded successfully! Analysis started.');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
    setTimeout(() => setError(null), 5000);
  };


  return (
    <Layout>
      <motion.section
        {...slideInVariants}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <Dna className="text-teal-400" size={36} />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              Admixture
            </h2>
            <p className="mt-2 text-teal-300/80">
              Upload your file for admixture analysis and explore your genetic ancestry
            </p>
          </div>
        </div>
      </motion.section>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30 flex items-start gap-3"
          >
            <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
            <p className="text-green-300">{successMessage}</p>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 flex items-start gap-3"
          >
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <VCFUploadForm
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <motion.div
            {...fadeInVariants}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-2xl font-semibold text-teal-100 mb-4">
              {loading ? 'Loading Analyses...' : 'Your Analyses'}
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Dna className="text-teal-400" size={48} />
                </motion.div>
              </div>
            ) : analyses.length === 0 ? (
              <div className="rounded-xl p-8 bg-slate-800/60 ring-1 ring-teal-600/30 text-center">
                <Dna className="mx-auto mb-4 text-teal-500" size={48} />
                <h4 className="text-lg font-semibold text-teal-100 mb-2">No analyses yet</h4>
                <p className="text-teal-400">Upload your first VCF file to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map(analysis => (
                  <AnalysisResultCard
                    key={analysis.id}
                    analysis={analysis}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};