import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, Info, Send, Globe, Users, BookOpen } from 'lucide-react';
import { Layout } from '../components/Layout';
import { AboutContribute } from '../components/AboutContribute';
import mainLogo from '../assets/logo.png';

export const HomePage: React.FC = () => {
  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h- rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/20">
              <img src={mainLogo} className="h-16 w-16 object-contain" alt="IranicDNA" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
                Iranic<span className="text-amber-300">DNA</span>
              </h1>
              <p className="text-sm text-teal-300/80 mt-2">Mapping Genetic Diversity of Iranian Peoples</p>
            </div>
          </div>
          
          <p className="text-lg text-teal-200/90 mb-8 max-w-2xl mx-auto">
            A community-driven initiative to visualize Y-DNA and mtDNA haplogroup distributions 
            across Iranian provinces.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/analytics"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-medium transition-colors"
            >
              <Dna size={20} /> View Analytics
            </Link>
            <Link
              to="/communities"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-800 hover:bg-cyan-700 text-white font-medium transition-colors"
            >
              <Users size={20} /> View Communities
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-800 hover:bg-purple-700 text-white font-medium transition-colors"
            >
              <BookOpen size={20} /> Read Blog
            </Link>
            <a
              href="https://t.me/Iranic_DNA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-800 hover:bg-amber-700 text-white font-medium transition-colors"
            >
              <Send size={20} /> Join Community
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="rounded-xl p-5 bg-teal-900/40 ring-1 ring-teal-600/30">
              <Dna className="mx-auto mb-3 text-teal-400" size={32} />
              <h3 className="text-lg font-semibold text-teal-100 mb-2">Haplogroup Data</h3>
              <p className="text-sm text-teal-300">Visualize root and subclade distributions with interactive charts</p>
            </div>
            <div className="rounded-xl p-5 bg-teal-900/40 ring-1 ring-teal-600/30">
              <Globe className="mx-auto mb-3 text-teal-400" size={32} />
              <h3 className="text-lg font-semibold text-teal-100 mb-2">Province Filter</h3>
              <p className="text-sm text-teal-300">Explore genetic data by specific Iranian provinces</p>
            </div>
            <div className="rounded-xl p-5 bg-teal-900/40 ring-1 ring-teal-600/30">
              <Info className="mx-auto mb-3 text-teal-400" size={32} />
              <h3 className="text-lg font-semibold text-teal-100 mb-2">Community Driven</h3>
              <p className="text-sm text-teal-300">Contribute your anonymized haplogroup results to expand our database</p>
            </div>
          </div>
        </div>
      </section>

      <AboutContribute />
    </Layout>
  );
};