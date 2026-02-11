import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { graphqlService, type FamousPerson } from '../services/graphqlService';

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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-teal-300 to-amber-300 bg-clip-text text-transparent">
          Famous Iranian People
        </h1>

        <div className="relative bg-teal-900/20 backdrop-blur-sm rounded-2xl p-8 ring-1 ring-teal-600/30">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden ring-2 ring-teal-500/30">
              <img
                src={currentPerson.image}
                alt={currentPerson.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x500?text=' + encodeURIComponent(currentPerson.name);
                }}
              />
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-teal-400 text-sm font-medium mb-2">{currentPerson.years}</p>
                <h2 className="text-3xl font-bold text-teal-100 mb-2">{currentPerson.name}</h2>
                <p className="text-xl text-amber-300 mb-4">{currentPerson.title}</p>
                <p className="text-teal-200 leading-relaxed">{currentPerson.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={goToPrevious}
                  className="p-3 rounded-lg bg-teal-800/40 hover:bg-teal-700/50 text-teal-100 transition-all ring-1 ring-teal-600/30"
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
                          ? 'w-8 bg-teal-400'
                          : 'w-2 bg-teal-700 hover:bg-teal-600'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNext}
                  className="p-3 rounded-lg bg-teal-800/40 hover:bg-teal-700/50 text-teal-100 transition-all ring-1 ring-teal-600/30"
                  aria-label="Next person"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="w-full py-2 px-4 rounded-lg bg-amber-800/30 hover:bg-amber-700/40 text-amber-200 text-sm transition-all ring-1 ring-amber-600/30"
              >
                {isAutoPlaying ? 'Pause' : 'Resume'} Slideshow
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-teal-300/70 text-sm">
          Slide {currentIndex + 1} of {people.length}
        </div>
      </div>
    </Layout>
  );
};
