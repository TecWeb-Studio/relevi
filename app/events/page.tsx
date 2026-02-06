'use client';

import { useEffect, useState } from 'react';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'workshop' | 'retreat' | 'special' | 'class';
  price: string;
  spots: number;
  spotsLeft: number;
}

export default function EventsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const events: Event[] = [
    {
      id: 1,
      title: 'Couples Massage Workshop',
      date: '2026-02-15',
      time: '10:00 AM - 1:00 PM',
      location: 'Main Studio',
      description:
        'Learn the art of therapeutic touch with your partner. This hands-on workshop teaches basic massage techniques for couples to practice at home. Includes instruction, materials, and light refreshments.',
      type: 'workshop',
      price: '$150 per couple',
      spots: 10,
      spotsLeft: 4,
    },
    {
      id: 2,
      title: 'Weekend Wellness Retreat',
      date: '2026-02-22',
      time: 'All Day',
      location: 'Mountain Springs Resort',
      description:
        'Escape to nature for a full weekend of relaxation and rejuvenation. Includes multiple massage sessions, yoga classes, meditation, healthy meals, and nature walks. Accommodations included.',
      type: 'retreat',
      price: '$450 per person',
      spots: 20,
      spotsLeft: 8,
    },
    {
      id: 3,
      title: 'Valentine\'s Day Special',
      date: '2026-02-14',
      time: 'Various Times',
      location: 'All Treatment Rooms',
      description:
        'Celebrate love with our special couples package. Includes side-by-side massages, aromatherapy, champagne, and chocolate-covered strawberries. Perfect for couples looking to connect and unwind.',
      type: 'special',
      price: '$280 per couple',
      spots: 12,
      spotsLeft: 5,
    },
    {
      id: 4,
      title: 'Self-Massage Techniques Class',
      date: '2026-02-20',
      time: '2:00 PM - 4:00 PM',
      location: 'Education Center',
      description:
        'Learn effective self-massage techniques to relieve tension in your neck, shoulders, hands, and feet. Perfect for those who work at desks or experience daily stress. Take home a self-care kit.',
      type: 'class',
      price: '$45 per person',
      spots: 15,
      spotsLeft: 12,
    },
    {
      id: 5,
      title: 'Meditation & Massage Combo',
      date: '2026-02-25',
      time: '9:00 AM - 11:30 AM',
      location: 'Zen Garden',
      description:
        'Begin with a guided meditation session followed by a relaxing Swedish massage. This combination helps deepen relaxation and promotes lasting calm. All levels welcome.',
      type: 'special',
      price: '$95 per person',
      spots: 8,
      spotsLeft: 3,
    },
    {
      id: 6,
      title: 'Aromatherapy Workshop',
      date: '2026-03-01',
      time: '6:00 PM - 8:00 PM',
      location: 'Main Studio',
      description:
        'Discover the healing power of essential oils. Learn about different oils, their properties, and how to blend them for maximum benefit. Create your own custom blend to take home.',
      type: 'workshop',
      price: '$65 per person',
      spots: 12,
      spotsLeft: 7,
    },
    {
      id: 7,
      title: 'Prenatal Massage Seminar',
      date: '2026-03-08',
      time: '11:00 AM - 12:30 PM',
      location: 'Education Center',
      description:
        'Expectant mothers and their partners are invited to learn about the benefits and techniques of prenatal massage. Includes a demonstration and Q&A session with our certified therapists.',
      type: 'class',
      price: '$30 per person',
      spots: 15,
      spotsLeft: 10,
    },
    {
      id: 8,
      title: 'Spring Renewal Retreat',
      date: '2026-03-15',
      time: '9:00 AM - 5:00 PM',
      location: 'Garden Pavilion',
      description:
        'Welcome spring with a full day of renewal activities. Includes morning yoga, massage treatments, organic lunch, guided nature meditation, and wellness workshops.',
      type: 'retreat',
      price: '$275 per person',
      spots: 25,
      spotsLeft: 15,
    },
  ];

  const filteredEvents =
    filter === 'all'
      ? events
      : events.filter((event) => event.type === filter);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workshop':
        return 'bg-blue-100 text-blue-700';
      case 'retreat':
        return 'bg-purple-100 text-purple-700';
      case 'special':
        return 'bg-pink-100 text-pink-700';
      case 'class':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-olive-100 text-olive-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white min-h-screen pt-24">
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              Upcoming <span className="text-gradient">Events</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join us for workshops, retreats, and special events designed to
              enhance your wellness journey and connect with our community.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-olive-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 reveal">
            {['all', 'workshop', 'retreat', 'special', 'class'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  filter === type
                    ? 'bg-olive-600 text-white shadow-lg'
                    : 'bg-olive-50 text-olive-700 hover:bg-olive-100'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="reveal bg-white rounded-3xl overflow-hidden shadow-lg hover-lift transition-all duration-300 border border-olive-100 flex flex-col"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-medium ${getEventTypeColor(
                        event.type
                      )}`}
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    <span className="text-olive-600 font-bold">
                      {event.price}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-olive-800 mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🕒</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-sm">
                      <span className="text-gray-500">Spots available: </span>
                      <span
                        className={`font-semibold ${
                          event.spotsLeft <= 3
                            ? 'text-red-500'
                            : 'text-olive-600'
                        }`}
                      >
                        {event.spotsLeft}/{event.spots}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="w-full bg-olive-600 text-white py-3 rounded-xl font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-olive-800 mb-2">
                No events found
              </h3>
              <p className="text-gray-600">
                Check back soon for new events in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <h2 className="text-4xl font-bold text-olive-800 mb-6">
                Host Your Own Event
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Interested in hosting a private wellness event? Whether it is a
                corporate retreat, bridal party, or special celebration, we can
                create a customized experience for your group.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    🎉
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800">
                      Private Parties
                    </h3>
                    <p className="text-gray-600">
                      Birthdays, bridal showers, and more
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    🏢
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800">
                      Corporate Events
                    </h3>
                    <p className="text-gray-600">
                      Team building and wellness days
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    💝
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800">
                      Special Occasions
                    </h3>
                    <p className="text-gray-600">
                      Anniversaries and romantic getaways
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal bg-white rounded-3xl p-8 md:p-12 shadow-xl" style={{ animationDelay: '200ms' }}>
              <h3 className="text-2xl font-bold text-olive-800 mb-6">
                Request Information
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all">
                    <option>Private Party</option>
                    <option>Corporate Event</option>
                    <option>Special Occasion</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your event..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-olive-600 text-white py-4 rounded-lg font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-[1.02] shadow-lg"
                >
                  Send Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="h-32 bg-gradient-to-br from-olive-100 to-olive-300 flex items-center justify-center">
                <span className="text-6xl">
                  {selectedEvent.type === 'workshop' && '🎓'}
                  {selectedEvent.type === 'retreat' && '🏔️'}
                  {selectedEvent.type === 'special' && '✨'}
                  {selectedEvent.type === 'class' && '📚'}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-olive-700 transition-colors shadow-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-medium ${getEventTypeColor(
                    selectedEvent.type
                  )}`}
                >
                  {selectedEvent.type.charAt(0).toUpperCase() +
                    selectedEvent.type.slice(1)}
                </span>
                <span className="text-2xl font-bold text-olive-600">
                  {selectedEvent.price}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-olive-800 mb-4">
                {selectedEvent.title}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="text-xl">📅</span>
                  <span className="font-medium">{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="text-xl">🕒</span>
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <span className="text-xl">📍</span>
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olive-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <p className="text-gray-500">Available Spots</p>
                  <p
                    className={`text-lg font-semibold ${
                      selectedEvent.spotsLeft <= 3
                        ? 'text-red-500'
                        : 'text-olive-600'
                    }`}
                  >
                    {selectedEvent.spotsLeft} of {selectedEvent.spots} remaining
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-6 py-3 border-2 border-olive-600 text-olive-600 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => alert('Registration coming soon!')}
                    className="px-6 py-3 bg-olive-600 text-white rounded-full font-semibold hover:bg-olive-700 transition-all duration-300"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
