import React, {  useEffect, useState } from 'react';
import { Home, Search, ShoppingCart, User, ChevronLeft, ChevronRight, Book, Beaker, Infinity, FileText, Camera, Gamepad2, Play, Clock, Star, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';

const heroSlides1 = [
  {
    title: "Urban Legends Explained",
    description: "Why do urban legends continue to thrive in our modern world? Explore the ways storytelling helps us face our fears, understand our own culture, and connect with each other.",
    bgImage: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)"
  },
  {
    title: "Ancient Civilizations",
    description: "Discover the mysteries of ancient worlds and how they shaped our modern society through archaeological evidence and historical analysis.",
    bgImage: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)"
  },
  {
    title: "Modern Physics",
    description: "Explore the fundamental forces that govern our universe, from quantum mechanics to relativity theory.",
    bgImage: "linear-gradient(135deg, #dbeafe 0%, #93c5fd 50%, #3b82f6 100%)"
  }
];

const categories1 = [
  {
    icon: <Book className="w-8 h-8" />,
    title: "History",
    bgImage: "linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)"
  },
  {
    icon: <Beaker className="w-8 h-8" />,
    title: "Science",
    bgImage: "linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)"
  },
  {
    icon: <Infinity className="w-8 h-8" />,
    title: "Philosophy & Religion",
    bgImage: "linear-gradient(135deg, #f3e8ff 0%, #8b5cf6 100%)"
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: "Literature",
    bgImage: "linear-gradient(135deg, #fecaca 0%, #ef4444 100%)"
  },
  {
    icon: <Camera className="w-8 h-8" />,
    title: "Travel & Culture",
    bgImage: "linear-gradient(135deg, #d1fae5 0%, #10b981 100%)"
  },
  {
    icon: <Gamepad2 className="w-8 h-8" />,
    title: "Hobby & Personal",
    bgImage: "linear-gradient(135deg, #fed7d7 0%, #f56565 100%)"
  }
];

const continueWatchingData = [
  {
    title: "The History of Ancient Rome",
    instructor: "Dr. Gregory Aldrete",
    progress: 65,
    duration: "24 lectures",
    thumbnail: "linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)"
  },
  {
    title: "Understanding Genetics",
    instructor: "Prof. David Sadava",
    progress: 30,
    duration: "36 lectures",
    thumbnail: "linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)"
  },
  {
    title: "Great World Religions",
    instructor: "Prof. Mark W. Muesse",
    progress: 80,
    duration: "12 lectures",
    thumbnail: "linear-gradient(135deg, #f3e8ff 0%, #8b5cf6 100%)"
  }
];

const newArrivedData = [
  {
    title: "Climate Change Science",
    instructor: "Dr. Richard Wolfson",
    rating: 4.8,
    lectures: "24 lectures",
    thumbnail: "linear-gradient(135deg, #d1fae5 0%, #10b981 100%)"
  },
  {
    title: "Modern Art Movements",
    instructor: "Prof. Sarah Burns",
    rating: 4.9,
    lectures: "18 lectures",
    thumbnail: "linear-gradient(135deg, #fecaca 0%, #ef4444 100%)"
  },
  {
    title: "Quantum Mechanics",
    instructor: "Dr. Benjamin Schumacher",
    rating: 4.7,
    lectures: "30 lectures",
    thumbnail: "linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%)"
  }
];

const comingSoonData = [
  {
    title: "Future of AI Technology",
    instructor: "Prof. Stuart Russell",
    releaseDate: "Coming Sept 2025",
    thumbnail: "linear-gradient(135deg, #f1f5f9 0%, #64748b 100%)"
  },
  {
    title: "Medieval European History",
    instructor: "Dr. Philip Daileader",
    releaseDate: "Coming Oct 2025",
    thumbnail: "linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)"
  },
  {
    title: "Advanced Psychology",
    instructor: "Prof. Catherine Sanderson",
    releaseDate: "Coming Nov 2025",
    thumbnail: "linear-gradient(135deg, #f3e8ff 0%, #8b5cf6 100%)"
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides,setHeroSlides] = useState(heroSlides1);
  const [categories,setCategories] = useState(categories1);


    useEffect(()=>{
      const interval = setInterval(() => {
        nextSlide();
      }, 3000);
      return () => clearInterval(interval);
    },[currentSlide])

    const fetchData = async ()=>{
      try{
        const res = await axios.get(`${API_URL}/api/home`);
        if(res.status===200){
          setHeroSlides(res.data.heroSlides);
          setCategories(res.data.categories);
        }
      }
      catch(err){
        console.log(err);
      }
    }
    useEffect(()=>{
      fetchData();},[])


  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="top-[80px] " style={{ backgroundColor: '#ffff' }}>


      {/* Main Container - 60% width, centered */}
      <div style={{width: '100%', margin: '0 auto', padding: '20px 0' }}>

        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-lg mb-12" style={{ height: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <div 
            className="absolute inset-0"
            style={{ background: heroSlides[currentSlide].bgImage }}
          >
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent, transparent)' }}></div>
          </div>
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute rounded-full cursor-pointer p-3 transition-all z-10"

            style={{ 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              backgroundColor: 'rgba(255,255,255,0.8)',
              color: '#374151',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,1)'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.8)'}

          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute rounded-full p-3 cursor-pointer transition-all z-10"

            style={{ 
              right: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              backgroundColor: 'rgba(255,255,255,0.8)',
              color: '#374151',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,1)'}
            onMouseLeave={(e) =>(e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.8)'}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* New Release Badge */}
          <div className="absolute z-10" style={{ top: '32px', right: '32px' }}>
            <div className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: '#f97316', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              New Release
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 h-full flex items-center">
            <div style={{ padding: '0 32px' }}>
              <div style={{ maxWidth: '512px' }}>
                <h2 className="text-5xl font-bold mb-6" style={{ color: '#1f2937' }}>
                  {heroSlides[currentSlide].title}
                </h2>
                <p className="text-xl mb-8 leading-relaxed" style={{ color: '#374151' }}>
                  {heroSlides[currentSlide].description}
                </p>
                <button 
                  className="px-8 py-3 rounded-full font-semibold transition-all"
                  style={{ backgroundColor: '#1f2937', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#111827'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1f2937'}
                >
                  Purchase Course
                </button>
              </div>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute flex space-x-2" style={{ bottom: '24px', left: '50%', transform: 'translateX(-50%)' }}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="w-3 h-3 rounded-full transition-all"
                style={{ 
                  backgroundColor: index === currentSlide ? '#1f2937' : '#9ca3af',
                  border: 'none',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold" style={{ color: '#1f2937' }}>Shop By Category</h3>
            <button 
              className="font-semibold text-sm uppercase tracking-wide transition-colors"
              style={{ color: '#f97316' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#ea580c'}

              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#f97316'}
            >
              VIEW ALL
            </button>
          </div>
          
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {categories.map((category, index) => (
              <div
                key={index}
                className="group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
                style={{ 
                  height: '192px',
                  background: category.bgImage,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transform: 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
              >
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
                <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="text-white mb-3 transition-transform duration-300" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                    {category.icon}
                  </div>
                  <h4 className="text-white font-semibold text-sm" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{category.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Continue Watching Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold" style={{ color: '#1f2937' }}>Continue Watching</h3>
            <button 
              className="font-semibold text-sm uppercase tracking-wide transition-colors"
              style={{ color: '#f97316' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#ea580c'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#f97316'}
            >
              VIEW ALL
            </button>
          </div>
          
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {continueWatchingData.map((course, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
                style={{ 
                  backgroundColor: 'white', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
              >
                <div 
                  className="relative"
                  style={{ height: '128px', background: course.thumbnail }}
                >
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <Play className="w-12 h-12 text-white" style={{ opacity: 0.8 }} />
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#1f2937' }}>{course.title}</h4>
                  <p className="text-sm mb-3" style={{ color: '#6b7280' }}>{course.instructor}</p>
                  <div className="flex items-center justify-between text-sm mb-3" style={{ color: '#9ca3af' }}>
                    <span>{course.duration}</span>
                    <span>{course.progress}% complete</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: '#e5e7eb' }}>
                    <div 
                      className="h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${course.progress}%`, backgroundColor: '#f97316' }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold" style={{ color: '#1f2937' }}>New Arrivals</h3>
            <button 
              className="font-semibold text-sm uppercase tracking-wide transition-colors"
              style={{ color: '#f97316' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#ea580c'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#f97316'}
            >
              VIEW ALL
            </button>
          </div>
          
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {newArrivedData.map((course, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
                style={{ 
                  backgroundColor: 'white', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
              >
                <div 
                  className="relative"
                  style={{ height: '128px', background: course.thumbnail }}
                >
                  <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}></div>
                  <div className="absolute px-2 py-1 rounded text-xs font-semibold" style={{ top: '8px', right: '8px', backgroundColor: '#10b981', color: 'white' }}>
                    NEW
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#1f2937' }}>{course.title}</h4>
                  <p className="text-sm mb-3" style={{ color: '#6b7280' }}>{course.instructor}</p>
                  <div className="flex items-center justify-between text-sm" style={{ color: '#9ca3af' }}>
                    <span>{course.lectures}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1" style={{ color: '#f59e0b' }} fill="currentColor" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold" style={{ color: '#1f2937' }}>Coming Soon</h3>
            <button 
              className="font-semibold text-sm uppercase tracking-wide transition-colors"
              style={{ color: '#f97316' }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#ea580c'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#f97316'}
            >
              VIEW ALL
            </button>
          </div>
          
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {comingSoonData.map((course, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
                style={{ 
                  backgroundColor: 'white', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  opacity: 0.9
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  e.currentTarget.style.opacity = '0.9';
                }}
              >
                <div 
                  className="relative flex items-center justify-center"
                  style={{ height: '128px', background: course.thumbnail }}
                >
                  <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
                  <Calendar className="w-12 h-12 text-white" style={{ opacity: 0.8 }} />
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 className="font-semibold mb-2" style={{ color: '#1f2937' }}>{course.title}</h4>
                  <p className="text-sm mb-3" style={{ color: '#6b7280' }}>{course.instructor}</p>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2" style={{ color: '#f97316' }} />
                    <span style={{ color: '#ea580c', fontWeight: 500 }}>{course.releaseDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}