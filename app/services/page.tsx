'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Service {
    id: number;
    title: string;
    description: string;
    fullDescription: string;
    icon: string;
    image?: string;
    benefits: string[];
    duration: string;
    price: string;
    recommended: boolean;
}

export default function ServicesPage() {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [filter, setFilter] = useState<string>('all');

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

    const services: Service[] = [
        {
            id: 1,
            title: 'Swedish Massage',
            description: 'A gentle, relaxing massage that uses long strokes and kneading to promote relaxation.',
            fullDescription:
                'Swedish Massage is one of the most popular massage techniques. It uses long gliding strokes, circular movements, kneading, and tapping to ease muscle tension and promote relaxation. Perfect for first-time clients and those seeking general wellness.',
            icon: '🌿',
            benefits: ['Stress relief', 'Improved circulation', 'Better sleep', 'Muscle relaxation'],
            duration: '60-90 minutes',
            price: '$80-120',
            recommended: true,
        },
        {
            id: 2,
            title: 'Deep Tissue',
            description: 'Targeted pressure on chronic tension areas to release deep-seated knots.',
            fullDescription:
                'Deep tissue massage uses slow, deliberate strokes and concentrated pressure on muscle layers to release chronic tension. This treatment is ideal for those with muscle knots, chronic pain, or high stress levels.',
            icon: '💆',
            benefits: ['Chronic pain relief', 'Improved range of motion', 'Athletic recovery', 'Tension release'],
            duration: '60-90 minutes',
            price: '$100-150',
            recommended: true,
        },
        {
            id: 3,
            title: 'Hot Stone Therapy',
            description: 'Heated basalt stones placed on key points to melt away tension and promote deep relaxation.',
            fullDescription:
                'Hot stone therapy combines massage with the therapeutic benefits of heated stones. The warmth penetrates deep into muscles, promoting relaxation and healing. Ideal for winter months and stress relief.',
            icon: '🔥',
            benefits: ['Deep relaxation', 'Pain relief', 'Improved circulation', 'Warmth therapy'],
            duration: '75-90 minutes',
            price: '$120-160',
            recommended: false,
        },
        {
            id: 4,
            title: 'Aromatherapy',
            description: 'Essential oils combined with massage techniques to enhance physical and emotional well-being.',
            fullDescription:
                'Aromatherapy harnesses the power of essential oils to enhance the massage experience. Each oil has unique therapeutic properties, from lavender for relaxation to eucalyptus for invigoration.',
            icon: '🌸',
            benefits: ['Emotional balance', 'Enhanced relaxation', 'Improved mood', 'Holistic wellness'],
            duration: '60-75 minutes',
            price: '$90-130',
            recommended: false,
        },
        {
            id: 5,
            title: 'Sports Massage',
            description: 'Specialized techniques to help athletes prepare for events and recover from training.',
            fullDescription:
                'Sports massage is designed specifically for athletes and active individuals. It helps prevent injuries, improves performance, and accelerates recovery from training and competition.',
            icon: '🏃',
            benefits: ['Performance enhancement', 'Injury prevention', 'Faster recovery', 'Improved flexibility'],
            duration: '60-90 minutes',
            price: '$100-140',
            recommended: true,
        },
        {
            id: 6,
            title: 'Reflexology',
            description: 'Pressure applied to specific points on the feet and hands to promote overall wellness.',
            fullDescription:
                'Reflexology is based on the principle that specific points on the feet and hands correspond to different organs and systems in the body. Stimulating these points promotes healing and balance throughout the body.',
            icon: '👣',
            benefits: ['Organ health', 'Improved energy', 'Stress reduction', 'Better sleep'],
            duration: '60 minutes',
            price: '$70-100',
            recommended: false,
        },
        {
            id: 7,
            title: 'Prenatal Massage',
            description: 'Specialized massage designed for pregnant women to reduce discomfort and promote wellness.',
            fullDescription:
                'Our prenatal massage is specifically designed for expecting mothers. Using safe techniques and specialized positioning, we help relieve back pain, reduce swelling, and prepare your body for labor.',
            icon: '🤰',
            benefits: ['Back pain relief', 'Reduced swelling', 'Better sleep', 'Stress relief'],
            duration: '60 minutes',
            price: '$85-115',
            recommended: false,
        },
        {
            id: 8,
            title: 'Couples Massage',
            description: 'Share a relaxing massage experience with someone special in our dedicated couples room.',
            fullDescription:
                'Enjoy a synchronized massage experience in our luxurious couples massage room. Perfect for anniversaries, special occasions, or simply quality time together with a loved one.',
            icon: '👫',
            benefits: ['Bonding experience', 'Stress relief', 'Quality time', 'Shared wellness'],
            duration: '60-90 minutes',
            price: '$160-240',
            recommended: true,
        },
    ];

    const filteredServices = services.filter((service) => {
        if (filter === 'recommended') return service.recommended;
        return true;
    });

    const categories = [
        { label: 'All Services', value: 'all' },
        { label: 'Recommended', value: 'recommended' },
    ];

    return (
        <div className="bg-white min-h-screen pt-24">
            {/* Hero Section */}
            <section className="py-16 bg-gradient-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center reveal">
                        <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
                            Our <span className="text-gradient">Services</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Discover our comprehensive range of therapeutic treatments designed
                            to restore balance to your body and mind. Each service is tailored
                            to meet your unique wellness needs.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <section className="py-8 bg-white border-b border-olive-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category.value}
                                onClick={() => setFilter(category.value)}
                                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${filter === category.value
                                        ? 'bg-olive-600 text-white shadow-lg'
                                        : 'bg-olive-100 text-olive-700 hover:bg-olive-200'
                                    }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredServices.map((service, index) => (
                            <div
                                key={service.id}
                                className="reveal group relative bg-white rounded-2xl overflow-hidden shadow-lg hover-lift transition-all duration-300 border border-olive-100 cursor-pointer"
                                style={{ animationDelay: `${index * 100}ms` }}
                                onClick={() => setSelectedService(service)}
                            >
                                {service.recommended && (
                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                                        ⭐ Recommended
                                    </div>
                                )}

                                <div className="h-40 bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center group-hover:from-olive-200 group-hover:to-olive-300 transition-all duration-300">
                                    {service.image ? (
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="text-7xl transform group-hover:scale-110 transition-transform duration-300">
                                            {service.icon}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="text-2xl font-bold text-olive-800 mb-2">
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-olive-100">
                                        <div>
                                            <p className="text-sm text-gray-500">Duration</p>
                                            <p className="font-semibold text-olive-700">
                                                {service.duration}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Price</p>
                                            <p className="font-semibold text-olive-700">
                                                {service.price}
                                            </p>
                                        </div>
                                    </div>

                                    <button className="w-full mt-4 bg-olive-600 text-white py-2 rounded-lg font-semibold hover:bg-olive-700 transition-all duration-300">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Package Section */}
            <section className="py-24 bg-olive-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 reveal">
                        <h2 className="text-4xl md:text-5xl font-bold text-olive-800 mb-4">
                            Service Packages
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Get more value with our specially curated packages
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Wellness Starter',
                                services: ['Swedish Massage', 'Aromatherapy Consultation'],
                                price: '$180',
                                description: 'Perfect for beginners',
                            },
                            {
                                name: 'Healing Retreat',
                                services: ['Deep Tissue', 'Hot Stone Therapy', 'Reflexology'],
                                price: '$320',
                                description: 'Our most popular package',
                                featured: true,
                            },
                            {
                                name: 'Premium Rejuvenation',
                                services: ['Swedish Massage', 'Hot Stone Therapy', 'Aromatherapy', 'Reflexology'],
                                price: '$420',
                                description: 'The ultimate experience',
                            },
                        ].map((pkg, idx) => (
                            <div
                                key={idx}
                                className={`reveal rounded-3xl p-8 transition-all duration-300 ${pkg.featured
                                        ? 'bg-gradient-to-br from-olive-600 to-olive-700 text-white shadow-2xl transform md:scale-105'
                                        : 'bg-white border-2 border-olive-200 hover-lift'
                                    }`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {pkg.featured && (
                                    <div className="text-center mb-4">
                                        <span className="inline-block bg-white text-olive-600 px-4 py-1 rounded-full text-sm font-bold">
                                            BEST VALUE
                                        </span>
                                    </div>
                                )}

                                <h3
                                    className={`text-2xl font-bold mb-2 ${pkg.featured ? 'text-white' : 'text-olive-800'
                                        }`}
                                >
                                    {pkg.name}
                                </h3>
                                <p
                                    className={`mb-6 ${pkg.featured ? 'text-olive-100' : 'text-gray-600'
                                        }`}
                                >
                                    {pkg.description}
                                </p>

                                <div className="mb-6">
                                    {pkg.services.map((service) => (
                                        <div
                                            key={service}
                                            className={`py-2 flex items-center gap-2 ${pkg.featured
                                                    ? 'text-olive-100'
                                                    : 'text-gray-700 border-b border-olive-200'
                                                }`}
                                        >
                                            <span className="text-lg">✓</span>
                                            {service}
                                        </div>
                                    ))}
                                </div>

                                <div
                                    className={`text-3xl font-bold mb-6 ${pkg.featured ? 'text-white' : 'text-olive-600'
                                        }`}
                                >
                                    {pkg.price}
                                </div>

                                <button
                                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${pkg.featured
                                            ? 'bg-white text-olive-600 hover:bg-olive-50'
                                            : 'bg-olive-600 text-white hover:bg-olive-700'
                                        }`}
                                >
                                    Book Package
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-olive-600 to-olive-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center reveal">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Ready to Book Your Service?
                        </h2>
                        <p className="text-xl text-olive-100 mb-8 max-w-2xl mx-auto">
                            Contact us today to schedule your appointment and take the first
                            step toward wellness and relaxation.
                        </p>
                        <Link
                            href="/"
                            className="inline-block bg-white text-olive-600 px-8 py-4 rounded-full font-semibold hover:bg-olive-50 transition-all duration-300 hover:scale-105 shadow-lg"
                        >
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </section>

            {/* Service Detail Modal */}
            {selectedService && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                    onClick={() => setSelectedService(null)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <div className="h-48 bg-gradient-to-br from-olive-100 to-olive-300 flex items-center justify-center">
                                {selectedService.image ? (
                                    <img
                                        src={selectedService.image}
                                        alt={selectedService.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-9xl">{selectedService.icon}</div>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedService(null)}
                                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-olive-700 transition-colors shadow-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-olive-800 mb-2">
                                        {selectedService.title}
                                    </h2>
                                    {selectedService.recommended && (
                                        <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                                            ⭐ Recommended
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-olive-800 mb-2">
                                    About This Service
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {selectedService.fullDescription}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-olive-800 mb-3">
                                    Benefits
                                </h3>
                                <ul className="grid grid-cols-2 gap-3">
                                    {selectedService.benefits.map((benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex items-center gap-2 text-gray-600"
                                        >
                                            <span className="text-olive-600 text-lg">✓</span>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-olive-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Duration</p>
                                    <p className="font-bold text-olive-700">
                                        {selectedService.duration}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Price</p>
                                    <p className="font-bold text-olive-700">
                                        {selectedService.price}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Therapists</p>
                                    <p className="font-bold text-olive-700">Specialized</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                                >
                                    Close
                                </button>
                                <button className="flex-1 bg-olive-600 text-white py-3 rounded-lg font-semibold hover:bg-olive-700 transition-all">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
