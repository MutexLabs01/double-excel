import { Check } from "lucide-react";

export default function AboutUs() {
  const coreValues = [
    { title: "Innovation", desc: "Constantly pushing boundaries with forward-thinking solutions." },
    { title: "Transparency", desc: "Open communication and honesty in every collaboration." },
    { title: "Excellence", desc: "Delivering work that exceeds expectations every time." },
    { title: "Collaboration", desc: "Working hand-in-hand with clients to achieve goals." },
  ];

  const whyChooseUs = [
    "Customized solutions tailored to your business needs",
    "Strong focus on innovation and cutting-edge technology",
    "Experienced and passionate team of developers & designers",
    "Reliable support and long-term partnerships",
  ];

  return (
    <section
      id="about"
      className="relative bg-gradient-to-b from-[#1B1C1D] via-[#282A2C] to-[#1B1C1D] text-gray-300 py-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* BACK TO HOME */}
        <div className="mb-10">
          <a
            href="/"
            className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-[#3281FD] to-[#346BF1] text-white font-medium hover:opacity-90 transition-all"
          >
            ← Back to Home
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#3281FD] to-[#346BF1] bg-clip-text text-transparent">
              About Double Excel
            </h2>
            <p className="text-lg leading-relaxed text-gray-400">
              At <span className="text-[#3281FD] font-semibold">Double Excel</span>, we deliver cutting-edge solutions
              that empower businesses to excel. Our team combines technical expertise, creative design, and a drive for
              excellence to craft impactful digital experiences.
            </p>
            <p className="text-lg leading-relaxed text-gray-400">
              We believe in innovation, transparency, and long-term partnerships. Whether it’s web development, digital
              transformation, or customized solutions — we double your potential to excel in the modern world.
            </p>
            <a
              href="#contact"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#3281FD] to-[#346BF1] text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
            >
              Get in Touch
            </a>
          </div>

          {/* Right Side Image */}
          <div className="flex justify-center md:justify-end">
            <img
              src="/mutex.png"
              alt="About Double Excel"
              className="w-full max-w-md rounded-2xl shadow-2xl border border-[#3281FD]/40 animate-float"
            />
          </div>
        </div>
      </div>

      {/* Our Core Values */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-24">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#346BF1] to-[#3281FD] bg-clip-text text-transparent">
          Our Core Values
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {coreValues.map((value, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-gradient-to-b from-[#282A2C] to-[#1B1C1D] border border-[#3281FD]/30 shadow-lg hover:shadow-[#3281FD]/40 hover:scale-105 transition-transform duration-300"
            >
              <h4 className="text-xl font-semibold text-[#3281FD] mb-3">{value.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="max-w-5xl mx-auto px-6 lg:px-12 mt-24">
        <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center bg-gradient-to-r from-[#3281FD] to-[#346BF1] bg-clip-text text-transparent">
          Why Choose Double Excel?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {whyChooseUs.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-xl bg-[#282A2C] border border-[#3281FD]/30 shadow hover:shadow-[#346BF1]/30 transition-transform duration-300 hover:scale-105"
            >
              <Check className="text-[#3281FD] mt-1 flex-shrink-0" />
              <p className="text-gray-300 text-lg">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}
