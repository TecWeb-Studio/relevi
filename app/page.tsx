'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

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

  const services = [
    {
      title: 'Swedish Massage',
      description:
        'A gentle, relaxing massage that uses long strokes and kneading to promote relaxation and improve circulation.',
      icon: '🌿',
    },
    {
      title: 'Deep Tissue',
      description:
        'Targeted pressure on chronic tension areas to release deep-seated knots and restore mobility.',
      icon: '💆',
    },
    {
      title: 'Hot Stone Therapy',
      description:
        'Heated basalt stones placed on key points to melt away tension and promote deep relaxation.',
      icon: '🔥',
    },
    {
      title: 'Aromatherapy',
      description:
        'Essential oils combined with massage techniques to enhance physical and emotional well-being.',
      icon: '🌸',
    },
    {
      title: 'Sports Massage',
      description:
        'Specialized techniques to help athletes prepare for events and recover from training.',
      icon: '🏃',
    },
    {
      title: 'Reflexology',
      description:
        'Pressure applied to specific points on the feet and hands to promote overall wellness.',
      icon: '👣',
    },
  ];

  return (
    <div className="bg-white">
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-light"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-olive-400 rounded-full mix-blend-multiply filter blur-xl animate-float" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-olive-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-olive-500 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInDown">
            <span className="text-olive-800">Welcome to </span>
            <span className="text-gradient">Serenity Touch</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            Where relaxation meets rejuvenation. Experience the healing power of
            therapeutic touch in our tranquil sanctuary.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scaleIn" style={{ animationDelay: '400ms' }}>
            <Link
              href="/team"
              className="bg-olive-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Meet Our Team
            </Link>
            <Link
              href="/events"
              className="bg-white text-olive-600 border-2 border-olive-600 px-8 py-4 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300 hover:scale-105"
            >
              View Events
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-olive-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our range of therapeutic treatments designed to restore
              balance to your body and mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="reveal bg-olive-50 rounded-2xl p-8 hover-lift transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-olive-800 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-6">
                Why Choose Serenity Touch?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      Expert Therapists
                    </h3>
                    <p className="text-gray-600">
                      Our certified massage therapists have years of experience
                      and specialized training in various techniques.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      Tranquil Environment
                    </h3>
                    <p className="text-gray-600">
                      Our spa is designed to be a peaceful sanctuary where you
                      can escape from the stresses of daily life.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      Premium Products
                    </h3>
                    <p className="text-gray-600">
                      We use only the highest quality organic oils and products
                      for all our treatments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal relative" style={{ animationDelay: '200ms' }}>
              <div className="aspect-square bg-olive-200 rounded-3xl flex items-center justify-center animate-pulse-slow">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4">🧘</div>
                  <p className="text-olive-800 text-lg font-medium">
                    Peaceful Environment
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-olive-400 rounded-2xl -z-10 animate-float" />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready to start your journey to relaxation? Contact us today to
              book your appointment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="reveal bg-olive-50 rounded-3xl p-8 md:p-12">
              <h3 className="text-2xl font-bold text-olive-800 mb-6">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white">
                    📍
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Address</p>
                    <p className="text-gray-600">123 Wellness Street, Tranquil City, TC 12345</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white">
                    📞
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Phone</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white">
                    ✉️
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Email</p>
                    <p className="text-gray-600">info@serenitytouch.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-olive-600 rounded-full flex items-center justify-center text-white">
                    🕒
                  </div>
                  <div>
                    <p className="text-gray-800 font-medium">Hours</p>
                    <p className="text-gray-600">Mon-Sat: 9AM - 8PM | Sun: 10AM - 6PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal" style={{ animationDelay: '200ms' }}>
              <form className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-olive-100">
                <h3 className="text-2xl font-bold text-olive-800 mb-6">
                  Book an Appointment
                </h3>
                <div className="space-y-4">
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
                      Message
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us about your needs..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-olive-600 text-white py-4 rounded-lg font-semibold hover:bg-olive-700 transition-all duration-300 hover:scale-[1.02] shadow-lg"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
