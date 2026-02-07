import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-olive-900 text-white py-12 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="animate-slideInLeft">
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-olive-300">Serenity</span> Touch
            </h3>
            <p className="text-olive-200 mb-4">
              Your journey to relaxation and wellness begins here. Experience the
              healing power of touch.
            </p>
          </div>

          <div className="animate-slideInUp" style={{ animationDelay: '100ms' }}>
            <h4 className="text-lg font-semibold mb-4 text-olive-300">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-olive-200 hover:text-white transition-colors duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-olive-200 hover:text-white transition-colors duration-300"
                >
                  Our Team
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-olive-200 hover:text-white transition-colors duration-300"
                >
                  Events
                </Link>
              </li>
            </ul>
          </div>

          <div className="animate-slideInRight" style={{ animationDelay: '200ms' }}>
            <h4 className="text-lg font-semibold mb-4 text-olive-300">
              Contact Us
            </h4>
            <ul className="space-y-2 text-olive-200">
              <li>123 Wellness Street</li>
              <li>Tranquil City, TC 12345</li>
              <li>Phone: (555) 123-4567</li>
              <li>Email: info@revelihealing.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-olive-700 mt-8 pt-8 text-center text-olive-300 animate-fadeIn">
          <p>
            &copy; {new Date().getFullYear()} ReleviHealing Massage Center. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
