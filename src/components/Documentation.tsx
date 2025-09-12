import { BookOpen, FileText, Settings, Headphones } from "lucide-react";

export default function Documentation() {
  const sections = [
    {
      title: "Getting Started",
      desc: "Learn how to set up and start using Double Excel in just a few steps.",
      icon: <BookOpen className="w-6 h-6 text-[#3281FD]" />,
      link: "#getting-started",
    },
    {
      title: "API Reference",
      desc: "Explore our REST API endpoints and learn how to integrate them.",
      icon: <FileText className="w-6 h-6 text-[#3281FD]" />,
      link: "#api-reference",
    },
    {
      title: "Configuration",
      desc: "Customize Double Excel for your business needs with flexible settings.",
      icon: <Settings className="w-6 h-6 text-[#3281FD]" />,
      link: "#configuration",
    },
    {
      title: "Support",
      desc: "Need help? Access our FAQs, support channels, and contact resources.",
      icon: <Headphones className="w-6 h-6 text-[#3281FD]" />,
      link: "#support",
    },
  ];

  return (
    <section
      id="documentation"
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

        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#3281FD] to-[#346BF1] bg-clip-text text-transparent">
            Double Excel Documentation
          </h2>
          <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
            Everything you need to know to use, customize, and scale with Double Excel.
          </p>
        </div>

        {/* DOC SECTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {sections.map((section, idx) => (
            <a
              key={idx}
              href={section.link}
              className="p-6 rounded-2xl bg-gradient-to-b from-[#282A2C] to-[#1B1C1D] border border-[#3281FD]/30 shadow-lg hover:shadow-[#3281FD]/40 hover:scale-105 transition-transform duration-300 flex flex-col items-start"
            >
              <div className="mb-4">{section.icon}</div>
              <h3 className="text-xl font-semibold text-[#3281FD] mb-2">
                {section.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {section.desc}
              </p>
            </a>
          ))}
        </div>

        {/* SAMPLE DOC CONTENT */}
        <div id="getting-started" className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4 text-[#3281FD]">Getting Started</h3>
          <p className="text-gray-400 mb-6">
            To get started with Double Excel, sign up for an account, choose your plan, and follow the setup wizard.
            You'll be ready to launch your first project in minutes.
          </p>
        </div>

        <div id="api-reference" className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4 text-[#3281FD]">API Reference</h3>
          <p className="text-gray-400 mb-6">
            Access our REST API at <code className="bg-[#1B1C1D] px-2 py-1 rounded">https://api.doubleexcel.com/v1</code>.
            Use your API key (available in your dashboard) to authenticate requests.
          </p>
        </div>

        <div id="configuration" className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4 text-[#3281FD]">Configuration</h3>
          <p className="text-gray-400 mb-6">
            Customize your workspace with environment variables, branding options, and advanced security settings.
          </p>
        </div>

        <div id="support" className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4 text-[#3281FD]">Support</h3>
          <p className="text-gray-400 mb-6">
            Need help? Visit our{" "}
            <a href="#faq" className="text-[#3281FD] hover:underline">FAQs</a> 
            , contact us at{" "}
            <a href="mailto:support@doubleexcel.com" className="text-[#3281FD] hover:underline">
              support@doubleexcel.com
            </a>, or join our community forums.
          </p>
        </div>
      </div>
    </section>
  );
}
