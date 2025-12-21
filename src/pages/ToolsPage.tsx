import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FlaskConical, Wrench } from 'lucide-react';
import { Layout } from '../components/Layout';
import { fadeInVariants, slideInVariants } from '../utils/deviceDetection';

export const ToolsPage: React.FC = () => {
  const tools = [
    {
      id: 'admixture',
      title: 'Admixture Analysis',
      description: 'Upload your VCF file for admixture analysis and explore your genetic ancestry',
      icon: FlaskConical,
      path: '/tools/admixture',
      color: 'from-teal-400 to-cyan-400',
      bgGradient: 'from-teal-900/20 to-cyan-900/20',
      borderColor: 'border-teal-500/30',
      hoverBorder: 'hover:border-teal-400/50',
    },
  ];

  return (
    <Layout>
      <motion.section
        {...slideInVariants}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <Wrench className="text-teal-400" size={36} />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
              Tools
            </h2>
            <p className="mt-2 text-teal-300/80">
              Explore our genetic analysis tools and resources
            </p>
          </div>
        </div>
      </motion.section>

      <motion.div
        {...fadeInVariants}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
            >
              <Link
                to={tool.path}
                className={`block rounded-xl p-6 bg-gradient-to-br ${tool.bgGradient} border ${tool.borderColor} ${tool.hoverBorder} transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${tool.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`bg-gradient-to-br ${tool.color} bg-clip-text text-transparent`} size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-teal-100 mb-2 group-hover:text-white transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-teal-300/80 group-hover:text-teal-200/90 transition-colors">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Future Tools Placeholder */}
      <motion.div
        {...fadeInVariants}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-10 rounded-xl p-8 bg-slate-800/40 border border-teal-600/20 text-center"
      >
        <Wrench className="mx-auto mb-4 text-teal-500/50" size={48} />
        <h4 className="text-lg font-semibold text-teal-100/70 mb-2">More Tools Coming Soon</h4>
        <p className="text-teal-400/60">
          We're working on adding more genetic analysis tools. Stay tuned!
        </p>
      </motion.div>
    </Layout>
  );
};