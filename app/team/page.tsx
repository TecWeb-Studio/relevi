'use client';

import { useEffect, useState } from 'react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  experience: string;
  certifications: string[];
  emoji: string;
  image: string;
}

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

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

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Corrado Zamboni',
      role: 'Founder & Lead Therapist',
      bio: 'With over 15 years of experience in therapeutic massage, Sarah founded ReleviHealing with a vision to create a sanctuary for healing and relaxation. Her holistic approach combines traditional techniques with modern wellness practices.',
      specialties: ['Deep Tissue', 'Swedish Massage', 'Hot Stone Therapy'],
      experience: '15+ years',
      certifications: ['Licensed Massage Therapist', 'Certified Aromatherapist', 'Reiki Master'],
      emoji: '👩‍⚕️',
      image: '/team-photos-crop/CorradoZamboni.jpg',
    },
    {
      id: 2,
      name: 'Denise Dalla Pasqua',
      role: 'Senior Massage Therapist',
      bio: 'James specializes in sports massage and injury rehabilitation. His background as a former athlete gives him unique insight into treating muscle tension and enhancing athletic performance.',
      specialties: ['Sports Massage', 'Deep Tissue', 'Myofascial Release'],
      experience: '10 years',
      certifications: ['Sports Massage Specialist', 'NASM-CPT', 'Kinesiology Certification'],
      emoji: '👨‍⚕️',
      image: '/team-photos-crop/DeniseDallaPasqua.jpg',
    },
    {
      id: 3,
      name: 'Francesca Tonon',
      role: 'Wellness Coordinator',
      bio: 'Maria brings warmth and expertise to every client interaction. Her intuitive touch and nurturing nature make her a favorite among those seeking relaxation and stress relief.',
      specialties: ['Swedish Massage', 'Prenatal Massage', 'Aromatherapy'],
      experience: '8 years',
      certifications: ['Licensed Massage Therapist', 'Prenatal Massage Certified', 'Aromatherapy Practitioner'],
      emoji: '👩‍🦱',
      image: '/team-photos-crop/FrancescaTonon.jpg',
    },
    {
      id: 4,
      name: 'Giancarlo Pavanello',
      role: 'Reflexology Specialist',
      bio: 'David has dedicated his career to the ancient art of reflexology. His precise pressure techniques help clients achieve balance and wellness through the power of touch.',
      specialties: ['Reflexology', 'Thai Massage', 'Shiatsu'],
      experience: '12 years',
      certifications: ['Certified Reflexologist', 'Thai Massage Practitioner', 'Shiatsu Specialist'],
      emoji: '👨‍🦲',
      image: '/team-photos-crop/GiancarloPavanello.jpg',
    },
    {
      id: 5,
      name: 'Grazia Sferrazza Callea',
      role: 'Spa Coordinator & Therapist',
      bio: 'Emma manages our spa operations while providing exceptional massage therapy services. Her organizational skills and therapeutic touch ensure every visit exceeds expectations.',
      specialties: ['Hot Stone Therapy', 'Couples Massage', 'Relaxation Massage'],
      experience: '6 years',
      certifications: ['Licensed Massage Therapist', 'Spa Management Certification', 'Hot Stone Specialist'],
      emoji: '👩‍💼',
      image: '/team-photos-crop/GraziaCallea.jpg',
    },
    {
      id: 6,
      name: 'Martina Pasut',
      role: 'Massage Therapist',
      bio: 'Michael combines Eastern and Western massage techniques to provide a unique therapeutic experience. His gentle yet effective approach helps clients find relief from chronic tension.',
      specialties: ['Swedish Massage', 'Deep Tissue', 'Cupping Therapy'],
      experience: '7 years',
      certifications: ['Licensed Massage Therapist', 'Cupping Therapy Certified', 'Tui Na Practitioner'],
      emoji: '👨‍💻',
      image: '/team-photos-crop/MartinaPasut.jpg',
    },
    {
      id: 7,
      name: 'Martina Roma',
      role: 'Massage Therapist',
      bio: 'Michael combines Eastern and Western massage techniques to provide a unique therapeutic experience. His gentle yet effective approach helps clients find relief from chronic tension.',
      specialties: ['Swedish Massage', 'Deep Tissue', 'Cupping Therapy'],
      experience: '7 years',
      certifications: ['Licensed Massage Therapist', 'Cupping Therapy Certified', 'Tui Na Practitioner'],
      emoji: '👨‍💻',
      image: '/team-photos-crop/MartinaRoma.jpg',
    },
    {
      id: 8,
      name: 'Massimo Gnesotto',
      role: 'Massage Therapist',
      bio: 'Michael combines Eastern and Western massage techniques to provide a unique therapeutic experience. His gentle yet effective approach helps clients find relief from chronic tension.',
      specialties: ['Swedish Massage', 'Deep Tissue', 'Cupping Therapy'],
      experience: '7 years',
      certifications: ['Licensed Massage Therapist', 'Cupping Therapy Certified', 'Tui Na Practitioner'],
      emoji: '👨‍💻',
      image: '/team-photos-crop/MassimoGnesotto2.jpg',
    },
    {
      id: 9,
      name: 'Monica Bortoluzzi',
      role: 'Massage Therapist',
      bio: 'Michael combines Eastern and Western massage techniques to provide a unique therapeutic experience. His gentle yet effective approach helps clients find relief from chronic tension.',
      specialties: ['Swedish Massage', 'Deep Tissue', 'Cupping Therapy'],
      experience: '7 years',
      certifications: ['Licensed Massage Therapist', 'Cupping Therapy Certified', 'Tui Na Practitioner'],
      emoji: '👨‍💻',
      image: '/team-photos-crop/MonicaBortoluzzi.jpg',
    },
    {
      id: 10,
      name: 'Paolo Avella',
      role: 'Massage Therapist',
      bio: 'Michael combines Eastern and Western massage techniques to provide a unique therapeutic experience. His gentle yet effective approach helps clients find relief from chronic tension.',
      specialties: ['Swedish Massage', 'Deep Tissue', 'Cupping Therapy'],
      experience: '7 years',
      certifications: ['Licensed Massage Therapist', 'Cupping Therapy Certified', 'Tui Na Practitioner'],
      emoji: '👨‍💻',
      image: '/team-photos-crop/PaoloAvella.jpg',
    },
    {
      id: 11,
      name: 'Sabrina Pozzobon',
      role: 'Massage Therapist',
      bio: 'Michael combines Eastern and Western massage techniques to provide a unique therapeutic experience. His gentle yet effective approach helps clients find relief from chronic tension.',
      specialties: ['Swedish Massage', 'Deep Tissue', 'Cupping Therapy'],
      experience: '7 years',
      certifications: ['Licensed Massage Therapist', 'Cupping Therapy Certified', 'Tui Na Practitioner'],
      emoji: '👨‍💻',
      image: '/team-photos-crop/SabrinaPozzobon.jpg',
    },
        {
      id: 12,
      name: 'Tamara Zanchetta',
      role: 'Massage Therapist',
      bio: 'Michael combines Eastern and Western massage techniques to provide a unique therapeutic experience. His gentle yet effective approach helps clients find relief from chronic tension.',
      specialties: ['Swedish Massage', 'Deep Tissue', 'Cupping Therapy'],
      experience: '7 years',
      certifications: ['Licensed Massage Therapist', 'Cupping Therapy Certified', 'Tui Na Practitioner'],
      emoji: '👨‍💻',
      image: '/team-photos-crop/TamaraZanchetta.jpg',
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-24">
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              Meet Our <span className="text-gradient">Team</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our dedicated team of certified massage therapists brings years of
              experience, passion, and expertise to help you achieve optimal
              wellness and relaxation.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="reveal bg-white rounded-3xl overflow-hidden shadow-lg hover-lift transition-all duration-300 group cursor-pointer border border-olive-100"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedMember(member)}
              >
                <div className="h-55 bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center group-hover:from-olive-200 group-hover:to-olive-300 transition-all duration-300">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-9xl transform group-hover:scale-110 transition-transform duration-300">
                      {member.emoji}
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-olive-800 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-olive-600 font-medium mb-4">{member.role}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.specialties.slice(0, 2).map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-olive-100 text-olive-700 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                    {member.specialties.length > 2 && (
                      <span className="px-3 py-1 bg-olive-100 text-olive-700 rounded-full text-sm">
                        +{member.specialties.length - 2} more
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    Experience: {member.experience}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-olive-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <h2 className="text-4xl font-bold text-olive-800 mb-6">
                Our Commitment to Excellence
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    🎓
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      Certified Professionals
                    </h3>
                    <p className="text-gray-600">
                      All our therapists are licensed and certified in their
                      respective specialties, ensuring you receive the highest
                      quality care.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    💚
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      Personalized Care
                    </h3>
                    <p className="text-gray-600">
                      We take the time to understand your unique needs and
                      customize each session to address your specific concerns.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    🌟
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      Continuous Learning
                    </h3>
                    <p className="text-gray-600">
                      Our team regularly participates in advanced training and
                      workshops to stay current with the latest techniques and
                      wellness trends.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal grid grid-cols-2 gap-6" style={{ animationDelay: '200ms' }}>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
                <div className="text-4xl font-bold text-olive-600 mb-2">15+</div>
                <p className="text-gray-600">Years Combined Experience</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
                <div className="text-4xl font-bold text-olive-600 mb-2">6</div>
                <p className="text-gray-600">Expert Therapists</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
                <div className="text-4xl font-bold text-olive-600 mb-2">20+</div>
                <p className="text-gray-600">Certifications</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
                <div className="text-4xl font-bold text-olive-600 mb-2">1000+</div>
                <p className="text-gray-600">Happy Clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <div className="h-94 bg-gradient-to-br from-olive-100 to-olive-300 flex items-center justify-center">
                {selectedMember.image ? (
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-9xl">{selectedMember.emoji}</div>
                )}
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-olive-700 transition-colors shadow-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-olive-800 mb-2">
                {selectedMember.name}
              </h2>
              <p className="text-olive-600 text-lg mb-6">{selectedMember.role}</p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olive-800 mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed">{selectedMember.bio}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olive-800 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-4 py-2 bg-olive-100 text-olive-700 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olive-800 mb-2">Certifications</h3>
                <ul className="space-y-2">
                  {selectedMember.certifications.map((cert) => (
                    <li key={cert} className="flex items-center gap-2 text-gray-600">
                      <span className="text-olive-600">✓</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <p className="text-gray-500">Experience</p>
                  <p className="text-olive-800 font-semibold">{selectedMember.experience}</p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="bg-olive-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-olive-700 transition-all duration-300"
                >
                  Book a Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
