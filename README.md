# Capacity Connect

Capacity Connect is a modern e-learning platform designed for managing training, publishing courses, and issuing certificates. It features role-based access for **Admins**, **Trainers**, and **Trainees**, complete with course wizards, media uploading, quizzes, analytics, and moderation queues.

## Tech Stack
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS / CSS Modules
- **Database:** PostgreSQL (via [Neon](https://neon.tech))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js (v5)](https://authjs.dev/)
- **Icons:** Lucide React
- **Charts:** Recharts

---

## Local Development Setup (Windows / macOS / Linux)

Follow these instructions to clone, set up, and run the project locally on your machine.

### 1. Prerequisites
- **Node.js** (v18 or higher recommended) - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/)
- A **PostgreSQL** database. You can run one locally using Docker, pgAdmin, or simply use a free cloud database like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).

### 2. Clone the Repository
Open your terminal (PowerShell, Command Prompt, or bash) and clone the repository:
```bash
git clone <your-github-repo-url>
cd Capacity-connect-main
```

### 3. Install Dependencies
Run the following command to install all required NPM packages:
```bash
npm install
```

### 4. Configure Environment Variables
Create a file named `.env` in the root of your project directory (`Capacity-connect-main`). 
Add the following configuration:

```env
# Database Connection (Replace with your own PostgreSQL connection string)
# Example: postgresql://postgres:password@localhost:5432/capacity_db
DATABASE_URL="postgresql://neondb_owner:npg_UQHfTGoN7C6M@ep-super-cake-ax95xvbk-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# NextAuth Configuration
AUTH_SECRET="capacity-connect-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Local Upload Limits (in Bytes)
UPLOAD_MAX_VIDEO_SIZE=262144000
UPLOAD_MAX_DOC_SIZE=52428800
UPLOAD_MAX_IMAGE_SIZE=5242880
UPLOAD_STORAGE="local"
```
*(Note: If you are deploying to production, make sure to change your `AUTH_SECRET` and secure your `DATABASE_URL`)*

### 5. Setup the Database
Next, push the Prisma schema to your PostgreSQL database. This will create all the necessary tables (Users, Courses, Resources, Quizzes, Certificates, etc.).

```bash
npx prisma db push
```

### 6. Seed the Database with Dummy Data
To easily test the platform, you can populate the database with mock courses, users, and certificates.

```bash
npm run db:seed
```

### 7. Run the Development Server
Finally, start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser. You should see the homepage!

---

## Test Accounts

If you ran `npm run db:seed` in step 6, the following accounts were created automatically. You can use these to log in and explore the different dashboards. All accounts share the same password.

**Password for all test accounts:** `password123`

| Role      | Name              | Email                   |
|-----------|-------------------|-------------------------|
| **Admin** | Admin User        | `admin@moes.gov.in`     |
| **Trainer**| Dr. Rajesh Kumar | `rajesh@moes.gov.in`    |
| **Trainer**| Dr. Anita Desai  | `anita@moes.gov.in`     |
| **Trainee**| Priya Sharma     | `priya@moes.gov.in`     |
| **Trainee**| Sneha Patel      | `sneha@moes.gov.in`     |
| **Trainee**| Amit Verma       | `amit@moes.gov.in`      |

---

## Features Walkthrough

- **For Admins (`admin@moes.gov.in`)**
  - **Homepage Publisher:** Broadcast announcements and notifications to all users.
  - **Course Validation:** Review and approve custom courses submitted by trainers before they go live.
  - **Certificate Validation:** Validate trainee certificates, automatically moving them to the "Verified" block.
  - **Moderation Queue:** View and manage forum reports.

- **For Trainers (`rajesh@moes.gov.in`)**
  - **Course Builder:** Use a multi-step wizard to create courses.
  - **Media Uploading:** Upload `.mp4` and `.pdf` files directly to the server.
  - **Analytics:** View course engagement, drop-off rates, and personalized trainee progress reports (including exact quiz scores).

- **For Trainees (`priya@moes.gov.in`)**
  - **Enrollment & Learning:** Browse published courses, enroll, and watch uploaded videos. 
  - **Quizzes:** Take automated quizzes at the end of courses to earn certificates.
  - **Certificates Dashboard:** Download and view certificates (shows "Pending Validation" until approved by an admin).

---

## Deployment (Vercel)
If you want to deploy this project live on Vercel:
1. Push your code to GitHub.
2. Import the project in Vercel.
3. In Vercel's settings, add the Environment Variables from your `.env` file.
4. Set the build command to: `npx prisma db push && npm run build`
5. Deploy!
