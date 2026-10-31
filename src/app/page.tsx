import Link from "next/link";
import { Church, Users, Calendar, DollarSign, BarChart3, Smartphone, CheckCircle2, ArrowRight, MessageSquare, Heart, Shield, Sparkles, QrCode } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Church className="h-7 w-7 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">KingdomFlow</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign In
              </Link>
              <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-600 mb-4">
              Made for communities
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Members. Ministry. Growth.
              <br />
              <span className="text-indigo-600">One Platform.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              Bring your church, ministry or campus fellowship together in one organized workspace. Manage members, attendance, giving, events and follow-ups — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-3.5 text-base font-medium text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-8 py-3.5 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                See Features
              </Link>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-gray-400">
              <Shield className="h-3.5 w-3.5" />
              <span>100% free • No credit card • Private, role-based workspaces</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything your ministry needs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From member management to financial reporting, KingdomFlow gives you all the tools to run your church effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Member Management", desc: "Searchable directory with detailed profiles, visitor tracking and family grouping." },
              { icon: QrCode, title: "Attendance & QR Check-In", desc: "Record attendance for services, events and meetings with QR code check-in." },
              { icon: DollarSign, title: "Giving & Finance", desc: "Track tithes, offerings, and expenses. Generate reports and receipts." },
              { icon: Calendar, title: "Events & Programmes", desc: "Plan and manage church events, services and ministry programmes." },
              { icon: MessageSquare, title: "Communication Centre", desc: "Reach members via WhatsApp, SMS and Email with one click." },
              { icon: Heart, title: "Follow-Up System", desc: "Track visitors, new believers and pastoral care. No one falls through the cracks." },
              { icon: BarChart3, title: "Reports & Analytics", desc: "Insights into growth, attendance trends, giving patterns and ministry impact." },
              { icon: Sparkles, title: "AI Assistant", desc: "Get intelligent help with planning, reports and ministry decisions." },
              { icon: Smartphone, title: "Mobile Friendly", desc: "Access from any device. Perfect for pastors and leaders on the go." },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mb-4">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free for Everyone */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Free for every church.
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            KingdomFlow is completely free for churches, ministries and fellowships of all sizes. No paid tiers, no hidden fees, no contact limits.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
            {[
              { value: "∞", label: "Members" },
              { value: "∞", label: "Branches" },
              { value: "∞", label: "Team Members" },
              { value: "Free", label: "Forever" },
            ].map((stat) => (
              <div key={stat.label} className="bg-indigo-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
                <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "WhatsApp & SMS", "Email campaigns", "AI Assistant", "QR Attendance",
              "Multi-branch", "CSV Import/Export", "Audit Logs", "Role-based access",
            ].map((feat) => (
              <span key={feat} className="inline-flex items-center gap-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to transform your ministry?
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Join churches across Ghana and Africa using KingdomFlow to grow their ministry.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg">
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
              <p className="text-sm">Modern church management for growing ministries.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><Link href="/auth/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Register</Link></li>
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
