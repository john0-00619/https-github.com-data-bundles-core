import Link from "next/link";
import { Church, Users, Calendar, DollarSign, BarChart3, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Church className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">KingdomFlow</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                About
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 mb-6">
              <span className="text-sm font-medium text-indigo-600">
                Built for churches in Ghana and across Africa
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Members. Ministry. Growth.
              <br />
              <span className="text-indigo-600">One Platform.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              KingdomFlow is the modern church management platform that helps pastors, administrators and ministry leaders manage members, attendance, giving, events and follow-ups — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                See Features
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • Free for small churches
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to grow your church
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From member management to financial reporting, KingdomFlow gives you all the tools to run your church effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Member Management",
                description: "Keep track of your church members, visitors, and families with a searchable directory and detailed profiles.",
              },
              {
                icon: Calendar,
                title: "Attendance Tracking",
                description: "Record attendance for services, events and meetings with manual entry or QR code check-in.",
              },
              {
                icon: DollarSign,
                title: "Giving & Finance",
                description: "Track tithes, offerings, and expenses. Generate financial reports and receipts for members.",
              },
              {
                icon: BarChart3,
                title: "Reports & Analytics",
                description: "Get insights into church growth, attendance trends, giving patterns and ministry impact.",
              },
              {
                icon: Smartphone,
                title: "Mobile Friendly",
                description: "Access KingdomFlow from any device. Perfect for pastors and leaders on the go.",
              },
              {
                icon: CheckCircle2,
                title: "Follow-Up System",
                description: "Track visitors, new believers and pastoral care tasks to ensure no one falls through the cracks.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your church. All plans include core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "For small churches just getting started",
                features: [
                  "Up to 50 members",
                  "Basic attendance tracking",
                  "1 branch",
                  "Email support",
                ],
                cta: "Get Started",
                highlighted: false,
              },
              {
                name: "Growth",
                price: "GHS 200",
                period: "/month",
                description: "For growing churches with multiple ministries",
                features: [
                  "Up to 500 members",
                  "Advanced attendance & QR check-in",
                  "Up to 5 branches",
                  "Financial reporting",
                  "Follow-up system",
                  "Priority support",
                ],
                cta: "Start Free Trial",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large churches and ministry networks",
                features: [
                  "Unlimited members",
                  "Unlimited branches",
                  "Advanced analytics",
                  "Custom integrations",
                  "Dedicated support",
                  "Training & onboarding",
                ],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-8 ${
                  plan.highlighted
                    ? "bg-indigo-600 text-white shadow-xl scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    plan.highlighted ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span
                    className={`text-4xl font-bold ${
                      plan.highlighted ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-indigo-100" : "text-gray-500"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mb-6 ${
                    plan.highlighted ? "text-indigo-100" : "text-gray-600"
                  }`}
                >
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "text-indigo-200" : "text-indigo-600"
                        }`}
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`w-full inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your church management?
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Join churches across Ghana and Africa using KingdomFlow to grow their ministry.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Church className="h-6 w-6 text-indigo-400" />
                <span className="text-lg font-bold text-white">KingdomFlow</span>
              </div>
              <p className="text-sm">
                Modern church management for growing ministries.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/auth/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
            <p>&copy; 2026 KingdomFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
