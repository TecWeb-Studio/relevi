'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TeamMember {
  id: number;
  key: string;
  image: string;
}

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const { t } = useTranslation();

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
    { id: 1, key: 'corradoZamboni', image: '/team-photos-crop/CorradoZamboni.jpg' },
    { id: 2, key: 'deniseDallaPasqua', image: '/team-photos-crop/DeniseDallaPasqua.jpg' },
    { id: 3, key: 'francescaTonon', image: '/team-photos-crop/FrancescaTonon.jpg' },
    { id: 4, key: 'giancarloPavanello', image: '/team-photos-crop/GiancarloPavanello.jpg' },
    { id: 5, key: 'graziaSferrazzaCallea', image: '/team-photos-crop/GraziaCallea.jpg' },
    { id: 6, key: 'martinaPasut', image: '/team-photos-crop/MartinaPasut.jpg' },
    { id: 7, key: 'martinaRoma', image: '/team-photos-crop/MartinaRoma.jpg' },
    { id: 8, key: 'massimoGnesotto', image: '/team-photos-crop/MassimoGnesotto2.jpg' },
    { id: 9, key: 'monicaBortoluzzi', image: '/team-photos-crop/MonicaBortoluzzi.jpg' },
    { id: 10, key: 'paoloAvella', image: '/team-photos-crop/PaoloAvella.jpg' },
    { id: 11, key: 'sabrinaPozzobon', image: '/team-photos-crop/SabrinaPozzobon.jpg' },
    { id: 12, key: 'tamaraZanchetta', image: '/team-photos-crop/TamaraZanchetta.jpg' },
  ];

  return (
    <div className="bg-white min-h-screen pt-24">
      <section className="py-16 bg-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <h1 className="text-5xl md:text-6xl font-bold text-olive-800 mb-6">
              {t('team.hero.title').split(t('team.hero.title').includes('Team') ? 'Team' : 'Team')[0]}
              <span className="text-gradient">
                {t('team.hero.title').includes('Team') ? 'Team' : 'Team'}
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('team.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Headmaster Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <h2 className="text-4xl font-bold text-olive-800 mb-4">
              {t('team.headmaster.sectionTitle')}
            </h2>
          </div>
          <div className="max-w-4xl mx-auto reveal">
            <div
              className="bg-white rounded-3xl overflow-hidden shadow-2xl hover-lift transition-all duration-300 group cursor-pointer border-2 border-olive-200"
              onClick={() => setSelectedMember({ id: 0, key: 'headmaster', image: '/team-photos-crop/FrancescaMayer.jpg' })}
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-96 md:h-auto bg-gradient-to-br from-olive-100 to-olive-200 flex items-center justify-center group-hover:from-olive-200 group-hover:to-olive-300 transition-all duration-300">
                  <img
                    src="/team-photos-crop/FrancescaMayer.jpg"
                    alt={t('team.members.headmaster.name')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-10 flex flex-col justify-center">
                  <div className="inline-block px-4 py-2 bg-olive-600 text-white rounded-full text-sm font-bold mb-4 self-start">
                    {t('team.headmaster.badge')}
                  </div>
                  <h3 className="text-3xl font-bold text-olive-800 mb-3">
                    {t('team.members.headmaster.name')}
                  </h3>
                  <p className="text-olive-600 font-medium text-lg mb-4">
                    {t('team.members.headmaster.role')}
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {t('team.members.headmaster.shortBio')}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(t('team.members.headmaster.specialties', { returnObjects: true }) as string[]).slice(0, 3).map((specialty: string) => (
                      <span
                        key={specialty}
                        className="px-4 py-2 bg-olive-100 text-olive-700 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm mb-6">
                    {t('team.experienceLabel')}: {t('team.members.headmaster.experience')}
                  </p>
                  <button className="bg-olive-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-olive-700 transition-all duration-300 self-start">
                    {t('team.viewProfile')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">"
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
                  <img
                    src={member.image}
                    alt={t(`team.members.${member.key}.name`)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-olive-800 mb-2">
                    {t(`team.members.${member.key}.name`)}
                  </h3>
                  <p className="text-olive-600 font-medium mb-4">{t(`team.members.${member.key}.role`)}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(t(`team.members.${member.key}.specialties`, { returnObjects: true }) as string[]).slice(0, 2).map((specialty: string) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-olive-100 text-olive-700 rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                    {(t(`team.members.${member.key}.specialties`, { returnObjects: true }) as string[]).length > 2 && (
                      <span className="px-3 py-1 bg-olive-100 text-olive-700 rounded-full text-sm">
                        +{(t(`team.members.${member.key}.specialties`, { returnObjects: true }) as string[]).length - 2} {t('team.more')}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {t('team.experienceLabel')}: {t(`team.members.${member.key}.experience`)}
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
                {t('team.commitment.title')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      {t('team.commitment.certifiedProfessionals.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('team.commitment.certifiedProfessionals.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      {t('team.commitment.personalizedCare.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('team.commitment.personalizedCare.description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-olive-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-olive-800 mb-2">
                      {t('team.commitment.continuousLearning.title')}
                    </h3>
                    <p className="text-gray-600">
                      {t('team.commitment.continuousLearning.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal grid grid-cols-2 gap-6" style={{ animationDelay: '200ms' }}>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
                <div className="text-4xl font-bold text-olive-600 mb-2">15+</div>
                <p className="text-gray-600">{t('team.stats.combinedExperience')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
                <div className="text-4xl font-bold text-olive-600 mb-2">12</div>
                <p className="text-gray-600">{t('team.stats.expertTherapists')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
                <div className="text-4xl font-bold text-olive-600 mb-2">20+</div>
                <p className="text-gray-600">{t('team.stats.certifications')}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
                <div className="text-4xl font-bold text-olive-600 mb-2">1000+</div>
                <p className="text-gray-600">{t('team.stats.happyClients')}</p>
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
                <img
                  src={selectedMember.image}
                  alt={t(`team.members.${selectedMember.key}.name`)}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-olive-700 transition-colors shadow-lg"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-olive-800 mb-2">
                {t(`team.members.${selectedMember.key}.name`)}
              </h2>
              <p className="text-olive-600 text-lg mb-6">{t(`team.members.${selectedMember.key}.role`)}</p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olive-800 mb-2">{t('team.modal.about')}</h3>
                <p className="text-gray-600 leading-relaxed">{t(`team.members.${selectedMember.key}.bio`)}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-olive-800 mb-2">{t('team.modal.specialties')}</h3>
                <div className="flex flex-wrap gap-2">
                  {(t(`team.members.${selectedMember.key}.specialties`, { returnObjects: true }) as string[]).map((specialty: string) => (
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
                <h3 className="text-lg font-semibold text-olive-800 mb-2">{t('team.modal.certifications')}</h3>
                <ul className="space-y-2">
                  {(t(`team.members.${selectedMember.key}.certifications`, { returnObjects: true }) as string[]).map((cert: string) => (
                    <li key={cert} className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-olive-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div>
                  <p className="text-gray-500">{t('team.experienceLabel')}</p>
                  <p className="text-olive-800 font-semibold">{t(`team.members.${selectedMember.key}.experience`)}</p>
                </div>
                <button
                  onClick={() => window.open('https://api.whatsapp.com/message/PIEXHXZ5H3RRJ1?autoload=1&app_absent=0', '_blank')}
                  className="bg-olive-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-olive-700 transition-all duration-300"
                >
                  {t('team.modal.bookSession')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
