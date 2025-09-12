export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-black via-[#0a0f1c] to-black text-gray-300 border-t border-blue-900">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-12">

        {/* Brand / CTA (Left Section) */}
        <div className="flex flex-col items-start space-y-6">
          <img
            src="../../mutex.png"
            alt="Mutex Logo"
            width={120}
            height={120}
            className="object-contain"
          />
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
            Double Excel
          </h2>
          <button className="mt-4 px-7 py-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base shadow-lg transition">
            Try for free
          </button>
        </div>

        {/* What is Double Excel? */}
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-6">What is Double Excel?</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Build a Digital Culture</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Design Insights</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Double Excel Research</a></li>
            <li><a href="/contact" className="hover:text-blue-400 transition">Contact Us</a></li>
          </ul>
        </div>

        {/* Community */}
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-6">Double Excel Community</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Double Excel Public</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">User Groups</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Community Leaders</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Dev Community</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Community Projects</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Forums</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Events</a></li>
          </ul>
        </div>

        {/* Partners */}
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-6">Partners</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Find a Partner</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Become a Partner</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xl font-semibold text-cyan-400 mb-6">Support</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-blue-400 transition">Knowledge Base</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Learning & Certification</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">Help Center</a></li>
            <li><a href="#" className="hover:text-blue-400 transition">All Releases</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 space-y-6 md:space-y-0">

          {/* Center: Links */}
          <div className="flex flex-wrap gap-6 justify-center">
            <a href="#" className="hover:text-blue-400 transition">Trust</a>
            <a href="#" className="hover:text-blue-400 transition">Blog</a>
            <a href="#" className="hover:text-blue-400 transition">Developer</a>
            <a href="/contact" className="hover:text-blue-400 transition">Contact Us</a>
            <a href="#" className="hover:text-blue-400 transition">Legal</a>
            <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition">Privacy</a>
          </div>

          {/* Right: Copyright */}
          <div className="text-center md:text-right text-gray-400">
            © {new Date().getFullYear()} Double Excel. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
