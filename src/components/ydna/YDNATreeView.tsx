import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { YDNATreeNode } from '../../services/graphqlService';

interface YDNATreeViewProps {
  treeData: YDNATreeNode[];
  onNodeClick: (node: YDNATreeNode) => void;
}

export const YDNATreeView: React.FC<YDNATreeViewProps> = ({ treeData, onNodeClick }) => {
  const [activeTab, setActiveTab] = useState<string>(treeData[0]?.name || '');
  const [showPaleoDNA, setShowPaleoDNA] = useState(true);
  const [showTMRCA, setShowTMRCA] = useState(true);

  const activeNode = treeData.find(n => n.name === activeTab);

  return (
    <div className="space-y-4">
      {treeData.length > 3 ? (
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-2 rounded-lg font-medium bg-slate-800/60 text-teal-300 border border-teal-700/20 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-colors"
          >
            {treeData.map((node) => (
              <option key={node.id} value={node.name}>
                {node.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {treeData.map((node) => (
            <button
              key={node.id}
              onClick={() => setActiveTab(node.name)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === node.name
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800/60 text-teal-300 hover:bg-slate-700/60'
              }`}
            >
              {node.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4 p-3 bg-slate-800/40 rounded-lg border border-teal-700/20">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPaleoDNA}
            onChange={(e) => setShowPaleoDNA(e.target.checked)}
            className="w-4 h-4 rounded border-teal-600 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-teal-300">PaleoDNA</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTMRCA}
            onChange={(e) => setShowTMRCA(e.target.checked)}
            className="w-4 h-4 rounded border-teal-600 text-teal-600 focus:ring-teal-500"
          />
          <span className="text-sm text-teal-300">TMRCA</span>
        </label>
      </div>

      {activeNode && (
        <div className="bg-slate-800/40 rounded-lg border border-teal-700/20 overflow-hidden">
          <TreeTable
            node={activeNode}
            onNodeClick={onNodeClick}
            showPaleoDNA={showPaleoDNA}
            showTMRCA={showTMRCA}
            level={0}
          />
        </div>
      )}
    </div>
  );
};

interface TreeTableProps {
  node: YDNATreeNode;
  onNodeClick: (node: YDNATreeNode) => void;
  showPaleoDNA: boolean;
  showTMRCA: boolean;
  level: number;
}

const TreeTable: React.FC<TreeTableProps> = ({ node, onNodeClick, showPaleoDNA, showTMRCA, level }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <div
        className={`flex items-center border-b border-teal-700/20 hover:bg-teal-900/20 transition-colors ${
          level === 0 ? 'bg-teal-900/30' : ''
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        <button
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-teal-700/30 rounded transition-colors"
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={16} className="text-teal-400" /> : <ChevronRight size={16} className="text-teal-400" />
          ) : (
            <span className="w-4 inline-block" />
          )}
        </button>

        <div className="flex-1 py-2 pr-3">
          <button
            onClick={() => onNodeClick(node)}
            className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition-colors"
          >
            {node.name}
          </button>
          {showTMRCA && node.tmrca && (
            <span className="ml-3 text-xs text-teal-400">TMRCA: {node.tmrca.toLocaleString()} years ago</span>
          )}
        </div>
      </div>

      {showPaleoDNA && node.paleoSamples && node.paleoSamples.length > 0 && (
        <div
          className="border-b border-teal-700/20 bg-amber-900/10"
          style={{ paddingLeft: `${level * 20 + 52}px` }}
        >
          {node.paleoSamples.map((sample, idx) => (
            <div key={idx} className="py-1.5 px-3 text-sm">
              <span className="text-amber-400">✓</span>
              <span className="ml-2 text-amber-300">{sample}</span>
            </div>
          ))}
        </div>
      )}

      {isExpanded && hasChildren && node.children.map((child) => (
        <TreeTable
          key={child.id}
          node={child}
          onNodeClick={onNodeClick}
          showPaleoDNA={showPaleoDNA}
          showTMRCA={showTMRCA}
          level={level + 1}
        />
      ))}
    </>
  );
};
