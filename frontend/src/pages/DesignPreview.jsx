import React from 'react';

// Ink Wash Color Palette (visual colors from the image):
// - Deep Charcoal: #2D2D2D (primary dark)
// - Warm Charcoal: #3D3D3D (cards, surfaces)
// - Dusty Slate Blue: #6B7B8C (accent)
// - Soft Gray: #9CA3AF (secondary text)
// - Warm Cream: #F5F2EB (light backgrounds)
// - Pure White: #FFFFFF (text on dark)

export default function DesignPreview() {
  // Sample data for preview
  const courses = [
    { id: 1, name: 'Son Gual Golf', location: 'Palma', holes: 18, image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600' },
    { id: 2, name: 'Golf Alcanada', location: 'Alcúdia', holes: 18, image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600' },
    { id: 3, name: 'Arabella Golf', location: 'Palma', holes: 18, image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600' },
  ];

  const hotels = [
    { id: 1, name: 'Hotel Formentor', category: '5-Star', location: 'Port de Pollença', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600' },
    { id: 2, name: 'Jumeirah Port Soller', category: '5-Star', location: 'Port de Sóller', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600' },
    { id: 3, name: 'Belmond La Residencia', category: '5-Star', location: 'Deià', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F2EB' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4" style={{ backgroundColor: 'rgba(45, 45, 45, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-white tracking-tight">
            Golfinmallorca<span style={{ color: '#6B7B8C' }}>.com</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-white/80 hover:text-white transition-colors text-sm tracking-wide">Golf Courses</a>
            <a href="#hotels" className="text-white/80 hover:text-white transition-colors text-sm tracking-wide">Hotels</a>
            <a href="#restaurants" className="text-white/80 hover:text-white transition-colors text-sm tracking-wide">Restaurants</a>
            <a href="#contact" className="text-white/80 hover:text-white transition-colors text-sm tracking-wide">Contact</a>
          </div>
          <button 
            className="px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#6B7B8C', color: '#FFFFFF' }}
          >
            Book Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1920)',
          }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(45, 45, 45, 0.5)' }}></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <p className="text-sm uppercase tracking-[0.3em] mb-6" style={{ color: '#6B7B8C' }}>
            Exclusive Golf Experiences
          </p>
          <h1 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
            Discover Mallorca's<br />
            <span className="font-semibold">Finest Golf</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light">
            Your gateway to premium golf courses, luxury accommodations, 
            and unforgettable Mediterranean experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-8 py-4 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#6B7B8C', color: '#FFFFFF' }}
            >
              Book Tee Time
            </button>
            <button 
              className="px-8 py-4 text-sm font-medium rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              Explore Courses
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Golf Courses Section */}
      <section id="courses" className="py-24 px-4" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: '#6B7B8C' }}>
              Premium Selection
            </p>
            <h2 className="text-4xl md:text-5xl font-light mb-6" style={{ color: '#2D2D2D' }}>
              Championship Golf Courses
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B7B8C' }}>
              Experience world-class golf at Mallorca's most prestigious courses
            </p>
          </div>

          {/* Course Cards - Simple Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="group rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                style={{ backgroundColor: '#2D2D2D' }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span 
                      className="px-3 py-1 text-xs font-medium rounded-full"
                      style={{ backgroundColor: '#6B7B8C', color: '#FFFFFF' }}
                    >
                      {course.holes} Holes
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{course.name}</h3>
                  <div className="flex items-center gap-2 text-white/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{course.location}</span>
                  </div>
                  <button 
                    className="mt-6 w-full py-3 text-sm font-medium rounded-full border transition-all duration-300 text-white/80 hover:text-white"
                    style={{ borderColor: '#6B7B8C' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section id="hotels" className="py-24 px-4" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: '#6B7B8C' }}>
              Luxury Stays
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6">
              Partner Hotels
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#9CA3AF' }}>
              Exclusive accommodations hand-picked for discerning golfers
            </p>
          </div>

          {/* Hotel Cards - Simple Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <div 
                key={hotel.id}
                className="group rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                style={{ backgroundColor: '#3D3D3D' }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span 
                      className="px-3 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur-sm text-white"
                    >
                      {hotel.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{hotel.name}</h3>
                  <div className="flex items-center gap-2" style={{ color: '#9CA3AF' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">{hotel.location}</span>
                  </div>
                  <button 
                    className="mt-6 w-full py-3 text-sm font-medium rounded-full transition-all duration-300"
                    style={{ backgroundColor: '#6B7B8C', color: '#FFFFFF' }}
                  >
                    View Hotel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4" style={{ backgroundColor: '#F5F2EB' }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: '#6B7B8C' }}>
            Get In Touch
          </p>
          <h2 className="text-4xl md:text-5xl font-light mb-6" style={{ color: '#2D2D2D' }}>
            Plan Your Golf Experience
          </h2>
          <p className="text-lg mb-12" style={{ color: '#6B7B8C' }}>
            Let our experts help you create the perfect Mallorca golf getaway
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-10 py-4 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#2D2D2D', color: '#FFFFFF' }}
            >
              Contact Us
            </button>
            <button 
              className="px-10 py-4 text-sm font-medium rounded-full border-2 transition-all duration-300 hover:scale-105"
              style={{ borderColor: '#2D2D2D', color: '#2D2D2D' }}
            >
              Call Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4" style={{ backgroundColor: '#2D2D2D' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-bold text-white tracking-tight">
              Golfinmallorca<span style={{ color: '#6B7B8C' }}>.com</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Privacy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Terms</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors text-sm">Contact</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-sm" style={{ color: '#6B7B8C' }}>
              © 2024 Golfinmallorca.com. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
