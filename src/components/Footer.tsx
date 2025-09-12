export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#1B1C1D] via-[#282A2C] to-[#1B1C1D] text-gray-300 border-t border-[#346BF1]">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-12">

        {/* Brand / CTA */}
        <div className="flex flex-col items-start space-y-6">
          <img
            src="../../mutex.png"
            alt="Mutex Logo"
            width={120}
            height={120}
            className="object-contain"
          />
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#3281FD] to-[#346BF1] bg-clip-text text-transparent drop-shadow-lg">
            Double Excel
          </h2>
          <button className="mt-4 px-7 py-3 rounded-md bg-[#3281FD] hover:bg-[#346BF1] text-white font-semibold text-base shadow-lg transition">
            Try for free
          </button>
        </div>

        {/* What is Double Excel? */}
        <div>
          <h3 className="text-xl font-semibold text-[#3281FD] mb-6">What is Double Excel?</h3>
          <ul className="space-y-3 text-sm">
            {["Build a Digital Culture","Design Insights","Double Excel Research","Contact Us"].map((item,i)=>(
              <li key={i}><a href="#" className="hover:text-[#346BF1] transition">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Community */}
        <div>
          <h3 className="text-xl font-semibold text-[#3281FD] mb-6">Double Excel Community</h3>
          <ul className="space-y-3 text-sm">
            {[
              "Double Excel Public","User Groups","Community Leaders","Dev Community",
              "Community Projects","Forums","Events"
            ].map((item,i)=>(
              <li key={i}><a href="#" className="hover:text-[#346BF1] transition">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Partners */}
        <div>
          <h3 className="text-xl font-semibold text-[#3281FD] mb-6">Partners</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-[#346BF1] transition">Find a Partner</a></li>
            <li><a href="#" className="hover:text-[#346BF1] transition">Become a Partner</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xl font-semibold text-[#3281FD] mb-6">Support</h3>
          <ul className="space-y-3 text-sm">
            {[
              "Knowledge Base","Learning & Certification","Help Center","All Releases"
            ].map((item,i)=>(
              <li key={i}><a href="#" className="hover:text-[#346BF1] transition">{item}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#282A2C] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 space-y-6 md:space-y-0">

          {/* Center: Links */}
          <div className="flex flex-wrap gap-6 justify-center">
            {["Trust","Blog","Developer","Contact Us","Legal","Terms of Service","Privacy"].map((item,i)=>(
              <a key={i} href="#" className="hover:text-[#3281FD] transition">{item}</a>
            ))}
          </div>

          {/* Right: Copyright */}
          <div className="text-center md:text-right">
            © {new Date().getFullYear()} Double Excel. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
