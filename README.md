# Capacity Connect

**Capacity Connect** is an enterprise e-learning and capacity-building platform developed for the Ministry of Earth Sciences (MoES). It provides end-to-end training management, real-time live virtual classrooms, interactive discussion forums with built-in moderation, media streaming, automated quiz evaluations, and verifiable certificate issuance.

---

## 🚀 Key Highlights & Subsystems

### 1. 🎥 Real-Time Live Classroom (LiveKit WebRTC)
- **Interactive Video & Audio**: HD camera and microphone support powered by LiveKit Cloud / self-hosted LiveKit.
- **Screen Sharing & Collaboration**: Present lecture slides, documents, or desktop screens in real-time.
- **In-Session Chat & Hand Raise**: Built-in chat stream and participant controls for interactive lectures.
- **Automated Attendance Logging**: Automatically captures trainee join time, leave time, and active participation duration in PostgreSQL.
- **Trainer Controls**: Schedule sessions, start/end calls, and manage participant streams.

### 2. 💬 Course Forums & Moderation System
- **Threaded Discussions**: Trainees and trainers can ask questions, share insights, and discuss course topics.
- **Verified Answers**: Trainers can mark responses as the official "Accepted Answer".
- **Upvoting System**: Community-driven ranking of useful questions and replies.
- **In-App Reporting**: Any trainee or trainer can flag inappropriate messages directly to the moderation queue with categorized reasons.
- **Admin Moderation Queue**: Dedicated portal (`/admin/reports`) for administrators to review flagged content, view context, dismiss false alarms, or permanently remove violating content.

### 3. 📚 Course Authoring & Learning Experience
- **Multi-Step Course Builder**: Step-by-step wizard for trainers to publish modules, syllabus, and course details.
- **Media Library**: Support for video lectures (`.mp4`) and downloadable reference materials (`.pdf`).
- **Interactive Quizzes**: Auto-graded assessments with instant score calculation and passing criteria.
- **Verifiable Certificates**: Cryptographically hashed certificates generated upon passing, with admin validation workflows.

### 4. 📊 Competency & Analytics
- **Competency Matrix**: Tracks trainer skill tags, administrative verification, and domain expertise.
- **Course Drop-Off & Progress Reports**: Granular trainee progress tracking and quiz performance metrics for trainers.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Frontend:** [React 19](https://react.dev/), Tailwind CSS, CSS Modules
- **Real-Time Video:** [LiveKit WebRTC](https://livekit.io/) (`livekit-client`, `livekit-server-sdk`, `@livekit/components-react`)
- **Database:** PostgreSQL (via [Neon Serverless Postgres](https://neon.tech/))
- **ORM:** [Prisma ORM 5](https://www.prisma.io/)
- **Authentication:** [NextAuth.js (v5 Beta)](https://authjs.dev/) with Prisma Adapter & BCrypt
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts & Visualizations:** [Recharts](https://recharts.org/)

---

## 📋 Local Development Setup

Follow these steps to clone and run the project locally.

### 1. Prerequisites
- **Node.js** (v18.17+ or v20+ recommended) — [Download Node.js](https://nodejs.org/)
- **Git** — [Download Git](https://git-scm.com/)
- A **PostgreSQL** database (Local Docker/pgAdmin or Cloud PostgreSQL like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/))
- *(Optional for Live Classroom)*: A free [LiveKit Cloud](https://cloud.livekit.io/) account for WebRTC live video credentials.

### 2. Clone the Repository
```bash
git clone https://github.com/neer-soni/capacity-connect.git
cd capacity-connect
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# ─── Database ──────────────────────────────────────────────────
# Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/capacity_connect?sslmode=require"

# ─── NextAuth ───────────────────────────────────────────────────
AUTH_SECRET="generate-a-strong-random-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# ─── LiveKit WebRTC (Live Classroom) ───────────────────────────
# Get free keys from https://cloud.livekit.io
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
LIVEKIT_URL="wss://your-project.livekit.cloud"
NEXT_PUBLIC_LIVEKIT_URL="wss://your-project.livekit.cloud"

# ─── Upload Limits (in Bytes) ──────────────────────────────────
UPLOAD_MAX_VIDEO_SIZE=262144000   # 250 MB
UPLOAD_MAX_DOC_SIZE=52428800      # 50 MB
UPLOAD_MAX_IMAGE_SIZE=5242880     # 5 MB
UPLOAD_STORAGE="local"
```

### 5. Push Schema to Database
Generate the Prisma Client and sync the schema with your PostgreSQL database:

```bash
npx prisma db push
```

### 6. Seed Test Accounts & Sample Data
Populate the database with default MoES accounts, courses, quizzes, forum posts, and sample certificates:

```bash
npm run db:seed
```

### 7. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Default Test Accounts

All accounts created by `npm run db:seed` use the same password:

> **Password for all accounts:** `password123`

| Role | Name | Email | Primary Responsibilities |
|---|---|---|---|
| **Admin** | Admin User | `admin@moes.gov.in` | User approvals, course publishing, certificate verification, moderation queue |
| **Trainer** | Dr. Rajesh Kumar | `rajesh@moes.gov.in` | Course creation, Live Classroom broadcasting, student analytics, forum guidance |
| **Trainer** | Dr. Anita Desai | `anita@moes.gov.in` | Course creation, live lectures, competency management |
| **Trainee** | Priya Sharma | `priya@moes.gov.in` | Enrolled in courses, live class attendee, quiz completion, certificate recipient |
| **Trainee** | Sneha Patel | `sneha@moes.gov.in` | Learning progress, forum discussions, quizzes |
| **Trainee** | Amit Verma | `amit@moes.gov.in` | Enrolled trainee |

---

## 🧭 Role-Based Walkthrough

### 🛡️ For Administrators (`admin@moes.gov.in`)
- **Dashboard (`/admin/dashboard`)**: Platform-wide metrics, active user distribution, course statistics.
- **User Approvals (`/admin/users`)**: Approve or reject pending trainee/trainer registration requests.
- **Course Review (`/admin/courses`)**: Quality review of draft courses submitted by trainers before publishing.
- **Certificate Verification (`/admin/certificates`)**: Inspect cryptographically hashed trainee certificates and mark them officially verified.
- **Competency Matrix (`/admin/competency`)**: Review and verify trainer skills, expertise tags, and platform ratings.
- **Moderation Queue (`/admin/reports`)**: Review user-flagged forum threads and replies with 1-click dismiss or permanent deletion.
- **Announcements (`/admin/homepage`)**: Publish banners and alerts to the public portal homepage.

### 👨‍🏫 For Trainers (`rajesh@moes.gov.in`)
- **Dashboard (`/trainer/dashboard`)**: Active courses, student count, upcoming live sessions.
- **Course Studio (`/trainer/courses/new`)**: Multi-step wizard to create modules, assign syllabus, upload lecture videos, and write quizzes.
- **Live Classroom (`/trainer/courses/[id]/live`)**: Schedule live WebRTC lectures, start sessions, broadcast video/audio, share screen, and monitor attendance.
- **Forum Discussions (`/trainer/courses/[id]/forum`)**: Answer trainee questions, upvote discussions, and award the official "Accepted Answer" badge.
- **Analytics & Reports (`/trainer/courses/[id]/report`)**: Track trainee completion percentages, drop-off rates, and exact quiz score breakdowns.
- **Resource Library (`/trainer/library`)**: Central repository of shared teaching documents and presentation slides.

### 🎓 For Trainees (`priya@moes.gov.in`)
- **Learning Portal (`/trainee/courses/[id]/learn`)**: Resume courses, stream video lectures, view PDFs, and complete module checkpoints.
- **Live Classroom (`/trainee/courses/[id]/live`)**: View scheduled sessions and join live interactive video classes with real-time audio and screen viewing.
- **Quizzes & Tests (`/trainee/courses/[id]/quiz`)**: Take interactive assessments to test knowledge retention.
- **Course Forum (`/trainee/courses/[id]/forum`)**: Ask doubts, upvote solutions, and report inappropriate comments to administrators.
- **Certificates (`/trainee/certificates`)**: Download signed certificates upon course completion and track administrative verification status.

---

## 🌐 Production Deployment (Vercel)

To deploy to Vercel:

1. Push your repository to GitHub.
2. Link the repository in the **Vercel Dashboard**.
3. Under **Project Settings → Environment Variables**, add:
   - `DATABASE_URL` (Your production PostgreSQL connection string)
   - `AUTH_SECRET` (A strong random secret string)
   - `NEXTAUTH_URL` (Your production domain, e.g. `https://your-domain.vercel.app`)
   - `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, `NEXT_PUBLIC_LIVEKIT_URL`
   - Upload limit variables (`UPLOAD_MAX_VIDEO_SIZE`, etc.)
4. Set the **Build Command** to:
   ```bash
   npx prisma db push && npm run build
   ```
5. Deploy!

---

## 📄 License
This project is proprietary and developed for internal training and capacity building under the **Ministry of Earth Sciences (MoES)**.
