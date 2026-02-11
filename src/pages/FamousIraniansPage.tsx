import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ChevronLeft, ChevronRight, Dna } from 'lucide-react';
import { graphqlService, type FamousPerson } from '../services/graphqlService';
import { API_BASE_URL } from '../config/api';

export const FamousIraniansPage: React.FC = () => {
  const [people, setPeople] = useState<FamousPerson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    graphqlService.fetchFamousPeople()
      .then(setPeople)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || people.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % people.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, people.length]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (people.length === 0) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-12 text-center text-teal-300">
          No famous people data available.
        </div>
      </Layout>
    );
  }

  const currentPerson = people[currentIndex];

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + people.length) % people.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % people.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const boldHaplogroup = (text: string, haplogroup: string) => {
    if (!haplogroup) return text;
    const parts = text.split(new RegExp(`(${haplogroup})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === haplogroup.toLowerCase() 
        ? <strong key={i} className="font-bold text-amber-400">{part}</strong>
        : part
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
          Famous Iranian People
        </h1>

        <div className="relative">
          <div className="bg-gradient-to-br from-teal-900/30 via-cyan-900/20 to-indigo-900/30 backdrop-blur-xl rounded-3xl p-8 md:p-12 ring-1 ring-teal-500/20 shadow-2xl">
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-2">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden ring-2 ring-teal-400/30">
                    <img
                      src={`${API_BASE_URL}${currentPerson.image}`}
                      alt={currentPerson.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x500?text=' + encodeURIComponent(currentPerson.name);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-teal-400 text-sm font-semibold tracking-wider uppercase">{currentPerson.years}</span>
                    {currentPerson.haplogroup && (
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 ring-1 ring-amber-500/30">
                        <Dna size={16} className="text-amber-400" />
                        <span className="text-amber-300 text-sm font-bold">{currentPerson.haplogroup}</span>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-cyan-200">
                    {currentPerson.name}
                  </h2>
                  
                  <p className="text-2xl text-amber-300 font-medium">{currentPerson.title}</p>
                  
                  <div className="h-px bg-gradient-to-r from-teal-500/50 via-cyan-500/50 to-transparent"></div>
                  
                  <p className="text-lg text-teal-100/90 leading-relaxed">
                    {boldHaplogroup(currentPerson.description, currentPerson.haplogroup)}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={goToPrevious}
                    className="p-4 rounded-xl bg-gradient-to-br from-teal-600/40 to-cyan-600/40 hover:from-teal-500/50 hover:to-cyan-500/50 text-teal-100 transition-all ring-1 ring-teal-400/30 shadow-lg"
                    aria-label="Previous person"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <div className="flex gap-2 flex-1 justify-center">
                    {people.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? 'w-12 bg-gradient-to-r from-teal-400 to-cyan-400'
                            : 'w-2 bg-teal-700/50 hover:bg-teal-600/70'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={goToNext}
                    className="p-4 rounded-xl bg-gradient-to-br from-teal-600/40 to-cyan-600/40 hover:from-teal-500/50 hover:to-cyan-500/50 text-teal-100 transition-all ring-1 ring-teal-400/30 shadow-lg"
                    aria-label="Next person"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/30 hover:from-amber-500/40 hover:to-orange-500/40 text-amber-200 font-medium transition-all ring-1 ring-amber-500/30 shadow-lg"
                >
                  {isAutoPlaying ? '⏸ Pause' : '▶ Resume'} Slideshow
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="inline-block px-4 py-2 rounded-full bg-teal-900/40 text-teal-300/80 text-sm font-medium ring-1 ring-teal-600/30">
              {currentIndex + 1} / {people.length}
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
};
