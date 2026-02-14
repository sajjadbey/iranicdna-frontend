import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { YDNATreeNode } from '../../services/graphqlService';

interface YDNATreeViewProps {
  treeData: YDNATreeNode[];
  onNodeClick: (node: YDNATreeNode) => void;
}

export const YDNATreeView: React.FC<YDNATreeViewProps> = ({ treeData, onNodeClick }) => {
  return (
    <div className="space-y-2">
      {treeData.map((node) => (
        <TreeNode key={node.id} node={node} onNodeClick={onNodeClick} level={0} />
      ))}
    </div>
  );
};

interface TreeNodeProps {
  node: YDNATreeNode;
  onNodeClick: (node: YDNATreeNode) => void;
  level: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onNodeClick, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleClick = () => {
    onNodeClick(node);
  };

  return (
    <div className="select-none">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          flex items-center gap-2 p-3 rounded-lg cursor-pointer
          transition-all duration-200
          ${level === 0 ? 'bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border-2 border-teal-600/30' : 'bg-slate-800/40 border border-teal-700/20'}
          hover:bg-teal-800/30 hover:border-teal-500/40
        `}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <button
          onClick={handleToggle}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-teal-700/30 transition-colors"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={18} className="text-teal-400" />
            ) : (
              <ChevronRight size={18} className="text-teal-400" />
            )
          ) : (
            <div className="w-1 h-1 rounded-full bg-teal-600" />
          )}
        </button>

        <div onClick={handleClick} className="flex-1 flex items-center gap-3">
          <Dna size={18} className="text-amber-400 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-teal-200">{node.name}</span>
              
              {node.isoggyghg && node.isoggyghg !== node.name && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 border border-blue-700/30">
                  ISOGG: {node.isoggyghg}
                </span>
              )}
              
              {node.yfullHg && node.yfullHg !== node.name && (
                <span className="text-xs px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/30">
                  YFull: {node.yfullHg}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-xs text-teal-400/70">
              {node.tmrca && (
                <span>TMRCA: ~{node.tmrca.toLocaleString()} ybp</span>
              )}
              {node.sampleCount > 0 && (
                <span>Samples: {node.sampleCount}</span>
              )}
              {node.paleoSamples && node.paleoSamples.length > 0 && (
                <span className="text-amber-400/70">
                  Ancient DNA: {node.paleoSamples.length}
                </span>
              )}
            </div>
          </div>

          {hasChildren && (
            <span className="text-xs px-2 py-1 rounded bg-teal-900/30 text-teal-300 border border-teal-700/30">
              {node.children.length} subclade{node.children.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {node.children.map((child) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  onNodeClick={onNodeClick}
                  level={level + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
