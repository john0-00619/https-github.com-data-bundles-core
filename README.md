# KingdomFlow

**Members. Ministry. Growth. One Platform.**

KingdomFlow is a modern church management web application designed to help churches, campus fellowships and Christian ministries manage members, attendance, events, departments, giving, follow-ups and more — all from one centralized platform.

Built for churches in Ghana and across Africa, with a design that works beautifully on any device.

## ✨ Key Features

- 👥 **Member Management** — Searchable directory, detailed profiles, CSV import/export, duplicate detection
- 📋 **Attendance Tracking** — Manual check-in, QR code check-in, session history, attendance trends
- 📅 **Events & Calendar** — Create services, meetings, conferences with scheduling and participant tracking
- 🏛️ **Departments & Groups** — Organize ministries, choirs, outreach teams and fellowship groups
- 💰 **Giving & Finance** — Track tithes, offerings, expenses with category reporting and receipts
- 🤝 **Follow-Up System** — Track visitors, new believers and pastoral care tasks with priority levels
- 🙏 **Prayer Requests** — Submit and track prayer needs, mark as answered
- 📢 **Announcements** — Share news with your church community, pin important updates
- 💬 **Communication Centre** — WhatsApp click-to-chat, SMS via TextBee, Gmail campaigns
- 📊 **Reports & Analytics** — Insights into membership growth, giving patterns, attendance trends
- 🔐 **Multi-Tenant Security** — Row-Level Security ensures complete data isolation between organizations
- 📱 **Mobile Responsive** — Works beautifully on phones, tablets and desktops

## 🏗️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- **Deployment**: Vercel
- **Validation**: Zod, React Hook Form
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project (or use the connected KingdomFlow project)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd https-github.com-data-bundles-core

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/              # Authentication pages (login, register, forgot-password)
│   ├── dashboard/         # Dashboard and all module pages
│   │   ├── members/       # Member directory and profiles
│   │   ├── attendance/    # Attendance tracking
│   │   ├── events/        # Event management
│   │   ├── departments/   # Department & group management
│   │   ├── giving/        # Financial tracking
│   │   ├── followups/     # Follow-up system
│   │   ├── prayer-requests/ # Prayer request management
│   │   ├── announcements/ # Church announcements
│   │   ├── reports/       # Analytics and reporting
│   │   ├── settings/      # Organization settings
│   │   └── onboarding/    # New user setup
│   └── page.tsx           # Landing page
├── components/
│   ├── layout/            # Dashboard layout with sidebar
│   └── ui/                # Reusable UI components
└── lib/
    ├── supabase/          # Supabase client (browser & server)
    ├── types.ts           # TypeScript types and permission model
    └── utils.ts           # Utility functions
```

## 🔐 Role-Based Access Control

KingdomFlow supports granular role-based access:

| Role | Permissions |
|------|------------|
| Owner | Full administrative control |
| Senior Pastor | Ministry-wide access to members, events, reports |
| Pastor | Assigned branch records, member care |
| Admin | Operational management with full CRUD |
| Secretary | Member records, attendance, events |
| Finance Officer | Giving records, expenses, financial reports |
| Department Leader | Assigned department members and activities |
| Follow-Up Officer | Visitor follow-ups and pastoral care tasks |
| Viewer | Read-only access to authorized information |

## 🗄️ Database Schema

All data is protected by Row-Level Security (RLS) policies ensuring:
- Complete tenant isolation between organizations
- Users can only access data for their organization
- Role-based write permissions enforced at the database level
- Audit logging for sensitive operations

## 📝 License

Proprietary — All rights reserved.

## 🤝 Support

For support, feature requests or bug reports, please open an issue on GitHub.
