import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ChevronLeft, ChevronRight, Dna, Calendar } from 'lucide-react';
import { graphqlService, type FamousPerson } from '../services/graphqlService';
import { API_BASE_URL } from '../config/api';

export const FamousIraniansPage: React.FC = () => {
  const [people, setPeople] = useState<FamousPerson[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState(false);

  useEffect(() => {
    graphqlService.fetchFamousPeople()
      .then(async (data) => {
        setPeople(data);
        await Promise.all(
          data.map((person) => 
            new Promise((resolve) => {
              const img = new Image();
              img.onload = resolve;
              img.onerror = resolve;
              img.src = person.imageUrl ? `${API_BASE_URL}${person.imageUrl}` : `https://via.placeholder.com/600x750?text=${encodeURIComponent(person.name)}`;
            })
          )
        );
        setAllImagesLoaded(true);
      })
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

  if (loading || !allImagesLoaded) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="inline-block w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (people.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center text-teal-300">
          No famous people data available.
        </div>
      </Layout>
    );
  }

  const currentPerson = people[currentIndex];

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setImageLoading(true);
    setCurrentIndex((prev) => (prev - 1 + people.length) % people.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setImageLoading(true);
    setCurrentIndex((prev) => (prev + 1) % people.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setImageLoading(true);
    setCurrentIndex(index);
    setExpandedQuote(false);
  };

  const boldHaplogroup = (text: string, haplogroup: string) => {
    if (!haplogroup) return text;
    const parts = text.split(new RegExp(`(${haplogroup})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === haplogroup.toLowerCase() 
        ? <span key={i} className="font-bold text-amber-300">{part}</span>
        : part
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 md:py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
            Historical Figures and Lineages
          </h1>
          <p className="text-teal-300/70 text-lg">Discover the legends who shaped history</p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900/50 via-teal-900/30 to-slate-900/50 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative aspect-[4/5] md:aspect-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-amber-500/10"></div>
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                    <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <img
                  src={currentPerson.imageUrl ? `${API_BASE_URL}${currentPerson.imageUrl}` : `https://via.placeholder.com/600x750?text=${encodeURIComponent(currentPerson.name)}`}
                  alt={currentPerson.name}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoading(false)}
                />
              </div>

              <div className="p-8 md:p-12 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 ring-1 ring-teal-500/20">
                      <Calendar size={16} className="text-teal-400" />
                      <span className="text-teal-300 text-sm font-medium">{currentPerson.years}</span>
                    </div>
                    {currentPerson.haplogroup && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
                        <Dna size={16} className="text-amber-400" />
                        <span className="text-amber-300 text-sm font-bold">{currentPerson.haplogroup}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
                      {currentPerson.name}
                    </h2>
                    <div 
                      onClick={() => setExpandedQuote(!expandedQuote)}
                      className="cursor-pointer bg-teal-900/30 border-l-4 border-teal-500 rounded-lg p-3 md:p-4 transition-all hover:bg-teal-900/40"
                    >
                      <p className="text-base md:text-lg text-amber-300/90 font-medium mb-2">{currentPerson.title}</p>
                      <p className={`text-sm md:text-base text-slate-300/90 leading-relaxed italic transition-all ${expandedQuote ? '' : 'line-clamp-2'}`}>
                        "{boldHaplogroup(currentPerson.description, currentPerson.haplogroup)}"
                      </p>
                      {!expandedQuote && currentPerson.description.length > 100 && (
                        <span className="text-teal-400 text-xs md:text-sm mt-1 inline-block">Show more...</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-teal-500/30 via-cyan-500/30 to-transparent"></div>
                </div>

                <div className="space-y-6 mt-8">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={goToPrevious}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-teal-300 transition-all ring-1 ring-white/10 hover:ring-white/20"
                      aria-label="Previous"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    
                    <div className="flex gap-2">
                      {people.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentIndex
                              ? 'w-8 bg-gradient-to-r from-teal-400 to-cyan-400'
                              : 'w-2 bg-white/20 hover:bg-white/30'
                          }`}
                          aria-label={`Slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={goToNext}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-teal-300 transition-all ring-1 ring-white/10 hover:ring-white/20"
                      aria-label="Next"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600/20 to-cyan-600/20 hover:from-teal-600/30 hover:to-cyan-600/30 text-teal-200 font-medium transition-all ring-1 ring-teal-500/20"
                  >
                    {isAutoPlaying ? '⏸ Pause' : '▶ Play'} Slideshow
                  </button>

                  <div className="text-center text-sm text-slate-400">
                    {currentIndex + 1} of {people.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
