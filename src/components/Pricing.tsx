import { Check, X } from "lucide-react";

export default function Pricing() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            desc: "For individuals exploring our services.",
            features: [
                { text: "Basic features", included: true },
                { text: "Community support", included: true },
                { text: "1 GB storage", included: true },
                { text: "Custom domain", included: false },
                { text: "Email support", included: false },
                { text: "API access", included: false },
            ],
        },
        {
            name: "Starter",
            price: "$19/mo",
            desc: "For freelancers & small projects.",
            features: [
                { text: "Everything in Free", included: true },
                { text: "Custom domain", included: true },
                { text: "Email support", included: true },
                { text: "5 GB storage", included: true },
                { text: "Basic analytics", included: true },
                { text: "Limited API access", included: true },
            ],
        },
        {
            name: "Pro",
            price: "$49/mo",
            desc: "For growing businesses & teams.",
            features: [
                { text: "Everything in Starter", included: true },
                { text: "Team collaboration", included: true },
                { text: "Advanced analytics", included: true },
                { text: "50 GB storage", included: true },
                { text: "Priority email support", included: true },
                { text: "Full API access", included: true },
            ],
            highlight: false,
        },
        {
            name: "Enterprise",
            price: "Custom",
            desc: "Tailored solutions for large organizations.",
            features: [
                { text: "Everything in Pro", included: true },
                { text: "Dedicated support manager", included: true },
                { text: "Custom integrations", included: true },
                { text: "Security compliance", included: true },
                { text: "Unlimited storage", included: true },
                { text: "On-premise deployment", included: true },
            ],
        },
    ];

    const addOns = [
        {
            title: "Extra Storage",
            price: "+$10 / 20 GB",
            desc: "Expand your storage anytime.",
        },
        {
            title: "Priority Support",
            price: "+$15 / mo",
            desc: "24/7 access to our support engineers.",
        },
        {
            title: "Custom Branding",
            price: "+$25 / mo",
            desc: "White-label your workspace with your own logo & colors.",
        },
    ];

    return (
        <section
            id="pricing"
            className="relative bg-gradient-to-b from-[#1B1C1D] via-[#282A2C] to-[#1B1C1D] text-gray-300 py-20"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
                
                {/* BACK TO HOME */}
                <div className="mb-8 text-left">
                    <a
                        href="/"
                        className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-[#3281FD] to-[#346BF1] text-white font-medium hover:opacity-90 transition-all"
                    >
                        ← Back to Home
                    </a>
                </div>

                {/* HEADER */}
                <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#3281FD] to-[#346BF1] bg-clip-text text-transparent">
                    Pricing Plans
                </h2>

                <p className="text-gray-400 mt-4 text-lg max-w-2xl mx-auto">
                    Choose the plan that fits your needs. Upgrade or downgrade anytime.
                </p>

                {/* Free Trial Button */}
                <button className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3281FD] to-[#346BF1] text-white font-semibold hover:opacity-90 transition-all">
                    Start a Free 30-Day Trial
                </button>

                {/* PLANS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`p-8 rounded-2xl border shadow-lg flex flex-col justify-between transition-transform hover:scale-105 ${plan.highlight
                                ? "bg-gradient-to-b from-[#3281FD] to-[#346BF1] border-[#3281FD] shadow-[#3281FD]/30"
                                : "bg-gradient-to-b from-[#282A2C] to-[#1B1C1D] border-[#3281FD]/30"
                                }`}
                        >
                            <div>
                                <h3 className="text-2xl font-bold mb-2 text-white">
                                    {plan.name}
                                </h3>
                                <p className="text-3xl font-extrabold mb-4 text-white">
                                    {plan.price}
                                </p>
                                <p className="text-gray-400 mb-6">{plan.desc}</p>

                                {/* FEATURES */}
                                <ul className="space-y-4 text-left">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            {feature.included ? (
                                                <Check className="text-green-400 w-5 h-5 flex-shrink-0" />
                                            ) : (
                                                <X className="text-red-400 w-5 h-5 flex-shrink-0" />
                                            )}
                                            <span className="text-gray-300">{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA */}
                            <button
                                className={`mt-8 w-full py-3 rounded-xl font-semibold transition-all ${plan.highlight
                                    ? "bg-white text-[#3281FD] hover:bg-gray-100"
                                    : "bg-gradient-to-r from-[#3281FD] to-[#346BF1] text-white hover:opacity-90"
                                    }`}
                            >
                                {plan.name === "Enterprise" ? "Contact Us" : "Get Started"}
                            </button>
                        </div>
                    ))}
                </div>

                {/* ADD-ONS */}
                <div className="mt-24">
                    <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#3281FD] to-[#346BF1] bg-clip-text text-transparent">
                        Add-Ons
                    </h3>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-12">
                        Enhance your plan with these optional extras. Add or remove them at any time.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {addOns.map((add, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-2xl bg-gradient-to-b from-[#282A2C] to-[#1B1C1D] border border-[#3281FD]/30 hover:border-[#3281FD] transition-colors flex flex-col justify-between"
                            >
                                <div>
                                    <h4 className="text-xl font-semibold mb-2 text-white">{add.title}</h4>
                                    <p className="text-gray-400">{add.desc}</p>
                                </div>

                                {/* Learn More button */}
                                <button className="mt-6 px-4 py-2 rounded-lg bg-gradient-to-r from-[#3281FD] to-[#346BF1] text-white font-medium hover:opacity-90 transition-all">
                                    Learn More
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
