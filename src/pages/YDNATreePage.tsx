import React, { useEffect, useState } from 'react';
import { Dna } from 'lucide-react';
import { Layout } from '../components/Layout';
import { YDNATreeView } from '../components/ydna/YDNATreeView';
import { HaplogroupDetailModal } from '../components/ydna/HaplogroupDetailModal';
import { AboutContribute } from '../components/AboutContribute';
import { graphqlService } from '../services/graphqlService';
import type { YDNATreeNode } from '../services/graphqlService';

export const YDNATreePage: React.FC = () => {
  const [treeData, setTreeData] = useState<YDNATreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<YDNATreeNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await graphqlService.fetchYDNATree();
        setTreeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Y-DNA tree');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Dna className="animate-spin text-teal-400" size={48} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center p-6 bg-slate-800/50 rounded-xl">
          <h2 className="text-2xl font-bold mb-2 text-red-400">Error</h2>
          <p className="text-sm text-teal-300">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
          Y-DNA Tree
        </h2>
        <p className="mt-2 text-teal-300/80">Sample count: {treeData.length}</p>
      </div>

      {treeData.length > 0 ? (
        <YDNATreeView treeData={treeData} onNodeClick={(node) => { setSelectedNode(node); setIsModalOpen(true); }} />
      ) : (
        <div className="text-center p-8 bg-slate-800/60 rounded-lg">
          <p className="text-teal-400">No data available</p>
        </div>
      )}

      <HaplogroupDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} node={selectedNode} />
      <AboutContribute />
    </Layout>
  );
};
