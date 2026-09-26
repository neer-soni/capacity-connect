import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.competencyMap.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.forumReply.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 12);

  // ─── Users ───
  const admin = await prisma.user.create({
    data: {
      name: "Dr. Anil Gupta",
      email: "admin@moes.gov.in",
      passwordHash: hash,
      role: "admin",
      status: "approved",
      department: "Administration",
      designation: "Platform Administrator",
      skills: JSON.stringify(["Management", "Policy", "Training Design"]),
      avatar: "AG",
    },
  });

  const trainer1 = await prisma.user.create({
    data: {
      name: "Dr. Rajesh Kumar",
      email: "rajesh@moes.gov.in",
      passwordHash: hash,
      role: "trainer",
      status: "approved",
      department: "Oceanography",
      designation: "Senior Scientist",
      skills: JSON.stringify(["Marine Biology", "Oceanography", "Python", "Data Analysis"]),
      avatar: "RK",
      verified: true,
    },
  });

  const trainer2 = await prisma.user.create({
    data: {
      name: "Dr. Meera Nair",
      email: "meera@moes.gov.in",
      passwordHash: hash,
      role: "trainer",
      status: "approved",
      department: "Climate Science",
      designation: "Chief Scientist",
      skills: JSON.stringify(["Climate Modeling", "GIS", "R Programming", "Remote Sensing"]),
      avatar: "MN",
      verified: true,
    },
  });

  const trainer3 = await prisma.user.create({
    data: {
      name: "Dr. Vikram Patel",
      email: "vikram@moes.gov.in",
      passwordHash: hash,
      role: "trainer",
      status: "approved",
      department: "Atmospheric Sciences",
      designation: "Research Scientist",
      skills: JSON.stringify(["Meteorology", "Weather Prediction", "Satellite Data"]),
      avatar: "VP",
      verified: true,
    },
  });

  const pendingTrainer = await prisma.user.create({
    data: {
      name: "Dr. Sunita Rao",
      email: "sunita@moes.gov.in",
      passwordHash: hash,
      role: "trainer",
      status: "pending",
      department: "Seismology",
      designation: "Assistant Scientist",
      skills: JSON.stringify(["Earthquake Analysis", "GIS"]),
      avatar: "SR",
    },
  });

  const trainee1 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@moes.gov.in",
      passwordHash: hash,
      role: "trainee",
      status: "approved",
      department: "Oceanography",
      designation: "Junior Scientist",
      skills: JSON.stringify(["Python", "Marine Biology"]),
      avatar: "PS",
    },
  });

  const trainee2 = await prisma.user.create({
    data: {
      name: "Amit Verma",
      email: "amit@moes.gov.in",
      passwordHash: hash,
      role: "trainee",
      status: "approved",
      department: "Climate Science",
      designation: "Research Fellow",
      skills: JSON.stringify(["Data Analysis", "R Programming"]),
      avatar: "AV",
    },
  });

  const trainee3 = await prisma.user.create({
    data: {
      name: "Sneha Patel",
      email: "sneha@moes.gov.in",
      passwordHash: hash,
      role: "trainee",
      status: "approved",
      department: "Atmospheric Sciences",
      designation: "Field Officer",
      skills: JSON.stringify(["Weather Monitoring"]),
      avatar: "SP",
    },
  });

  console.log("  ✓ Users created");

  // ─── Courses ───
  const course1 = await prisma.course.create({
    data: {
      title: "Introduction to Oceanography",
      description: "Comprehensive introduction to physical and biological oceanography covering ocean circulation, marine ecosystems, and observational techniques used in modern ocean science.",
      trainerId: trainer1.id,
      department: "Oceanography",
      tags: JSON.stringify(["Oceanography", "Marine Biology", "Python", "Data Analysis"]),
      status: "published",
      duration: "8 weeks",
      level: "Beginner",
      thumbnail: "🌊",
      totalLessons: 12,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Climate Change & Earth Systems",
      description: "Advanced study of climate dynamics, greenhouse effect, paleoclimatology, and climate modeling approaches used by IPCC and MoES research divisions.",
      trainerId: trainer2.id,
      department: "Climate Science",
      tags: JSON.stringify(["Climate Science", "GIS", "Remote Sensing", "Climate Modeling"]),
      status: "published",
      duration: "10 weeks",
      level: "Intermediate",
      thumbnail: "🌍",
      totalLessons: 16,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: "Atmospheric Sciences Fundamentals",
      description: "Core concepts in atmospheric physics, weather systems, monsoon dynamics, and satellite-based atmospheric monitoring relevant to Indian subcontinent.",
      trainerId: trainer3.id,
      department: "Atmospheric Sciences",
      tags: JSON.stringify(["Meteorology", "Weather Prediction", "Satellite Data"]),
      status: "published",
      duration: "6 weeks",
      level: "Beginner",
      thumbnail: "🌤️",
      totalLessons: 10,
    },
  });

  const course4 = await prisma.course.create({
    data: {
      title: "Deep Sea Exploration Techniques",
      description: "Advanced techniques in deep sea exploration including ROV operations, deep sea sampling, and geophysical survey methods used in India's deep ocean mission.",
      trainerId: trainer1.id,
      department: "Deep Sea",
      tags: JSON.stringify(["Deep Sea", "ROV", "Geophysics", "Sampling"]),
      status: "published",
      duration: "12 weeks",
      level: "Advanced",
      thumbnail: "🐙",
      totalLessons: 18,
    },
  });

  const course5 = await prisma.course.create({
    data: {
      title: "GIS & Remote Sensing for Earth Sciences",
      description: "Hands-on training in GIS tools, satellite image processing, and spatial analysis techniques critical for earth science research.",
      trainerId: trainer2.id,
      department: "Space Applications",
      tags: JSON.stringify(["GIS", "Remote Sensing", "Spatial Analysis", "QGIS"]),
      status: "published",
      duration: "8 weeks",
      level: "Intermediate",
      thumbnail: "🛰️",
      totalLessons: 14,
    },
  });

  const course6 = await prisma.course.create({
    data: {
      title: "Seismology & Earthquake Monitoring",
      description: "Introduction to seismological methods, earthquake hazard assessment, and India's seismic monitoring network operations.",
      trainerId: trainer3.id,
      department: "Seismology",
      tags: JSON.stringify(["Seismology", "Earthquake", "Hazard Assessment"]),
      status: "draft",
      duration: "6 weeks",
      level: "Intermediate",
      thumbnail: "🏔️",
      totalLessons: 8,
    },
  });

  console.log("  ✓ Courses created");

  // ─── Resources ───
  const resourceData = [
    {
      courseId: course1.id, type: "video", title: "Introduction & Course Overview",
      duration: "12 min", size: "128 MB", sizeBytes: 134217728,
      mimeType: "video/mp4", storageKey: "", url: "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadedBy: trainer1.id,
    },
    {
      courseId: course1.id, type: "pdf", title: "Ocean Layers & Zones Handbook",
      size: "2.4 MB", sizeBytes: 2516582,
      mimeType: "application/pdf", storageKey: "", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploadedBy: trainer1.id,
    },
    {
      courseId: course1.id, type: "video", title: "Ocean Circulation Patterns",
      duration: "28 min", size: "290 MB", sizeBytes: 304087040,
      mimeType: "video/mp4", storageKey: "", url: "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadedBy: trainer1.id,
    },
    {
      courseId: course1.id, type: "slide", title: "Marine Ecosystems Lecture Slides",
      size: "5.1 MB", sizeBytes: 5347737,
      mimeType: "application/pdf", storageKey: "", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploadedBy: trainer1.id,
    },
    {
      courseId: course1.id, type: "video", title: "Lab: Salinity Measurement",
      duration: "22 min", size: "235 MB", sizeBytes: 246422528,
      mimeType: "video/mp4", storageKey: "", url: "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadedBy: trainer1.id,
    },
    {
      courseId: course2.id, type: "video", title: "Climate System Overview",
      duration: "18 min", size: "190 MB", sizeBytes: 199229440,
      mimeType: "video/mp4", storageKey: "", url: "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadedBy: trainer2.id,
    },
    {
      courseId: course2.id, type: "pdf", title: "IPCC AR6 Summary Guide",
      size: "8.7 MB", sizeBytes: 9123635,
      mimeType: "application/pdf", storageKey: "", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploadedBy: trainer2.id,
    },
    {
      courseId: course2.id, type: "video", title: "Greenhouse Effect Deep Dive",
      duration: "34 min", size: "355 MB", sizeBytes: 372244480,
      mimeType: "video/mp4", storageKey: "", url: "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadedBy: trainer2.id,
    },
    {
      courseId: course3.id, type: "video", title: "Atmospheric Structure",
      duration: "15 min", size: "158 MB", sizeBytes: 165675008,
      mimeType: "video/mp4", storageKey: "", url: "https://www.w3schools.com/html/mov_bbb.mp4",
      uploadedBy: trainer3.id,
    },
    {
      courseId: course3.id, type: "pdf", title: "Indian Monsoon Study Guide",
      size: "4.2 MB", sizeBytes: 4404019,
      mimeType: "application/pdf", storageKey: "", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      uploadedBy: trainer3.id,
    },
  ];

  for (const r of resourceData) {
    await prisma.resource.create({ data: r });
  }
  console.log("  ✓ Resources created");

  // ─── Enrollments ───
  const enrollment1 = await prisma.enrollment.create({
    data: { userId: trainee1.id, courseId: course1.id, progress: 65, status: "in_progress" },
  });
  const enrollment2 = await prisma.enrollment.create({
    data: { userId: trainee1.id, courseId: course2.id, progress: 100, status: "completed", completedAt: new Date("2024-08-20") },
  });
  await prisma.enrollment.create({
    data: { userId: trainee1.id, courseId: course3.id, progress: 30, status: "in_progress" },
  });
  await prisma.enrollment.create({
    data: { userId: trainee2.id, courseId: course1.id, progress: 45, status: "in_progress" },
  });
  await prisma.enrollment.create({
    data: { userId: trainee2.id, courseId: course5.id, progress: 80, status: "in_progress" },
  });
  await prisma.enrollment.create({
    data: { userId: trainee3.id, courseId: course3.id, progress: 100, status: "completed", completedAt: new Date("2024-09-01") },
  });
  await prisma.enrollment.create({
    data: { userId: trainee3.id, courseId: course4.id, progress: 20, status: "in_progress" },
  });

  console.log("  ✓ Enrollments created");

  // ─── Assessments ───
  const assessment1 = await prisma.assessment.create({
    data: {
      courseId: course1.id,
      title: "Oceanography Mid-Term Quiz",
      deadline: new Date("2024-10-01"),
      timeLimit: 30,
    },
  });

  const q1 = await prisma.question.create({
    data: { assessmentId: assessment1.id, text: "What is the primary driver of thermohaline circulation?" },
  });
  const q1opts = await Promise.all([
    prisma.option.create({ data: { questionId: q1.id, text: "Wind patterns" } }),
    prisma.option.create({ data: { questionId: q1.id, text: "Temperature and salinity differences" } }),
    prisma.option.create({ data: { questionId: q1.id, text: "Tidal forces" } }),
    prisma.option.create({ data: { questionId: q1.id, text: "Volcanic activity" } }),
  ]);
  await prisma.question.update({ where: { id: q1.id }, data: { correctOptionId: q1opts[1].id } });

  const q2 = await prisma.question.create({
    data: { assessmentId: assessment1.id, text: "Which ocean zone receives the most sunlight?" },
  });
  const q2opts = await Promise.all([
    prisma.option.create({ data: { questionId: q2.id, text: "Euphotic zone" } }),
    prisma.option.create({ data: { questionId: q2.id, text: "Bathyal zone" } }),
    prisma.option.create({ data: { questionId: q2.id, text: "Abyssal zone" } }),
    prisma.option.create({ data: { questionId: q2.id, text: "Hadal zone" } }),
  ]);
  await prisma.question.update({ where: { id: q2.id }, data: { correctOptionId: q2opts[0].id } });

  const q3 = await prisma.question.create({
    data: { assessmentId: assessment1.id, text: "What percentage of Earth's surface is covered by oceans?" },
  });
  const q3opts = await Promise.all([
    prisma.option.create({ data: { questionId: q3.id, text: "51%" } }),
    prisma.option.create({ data: { questionId: q3.id, text: "61%" } }),
    prisma.option.create({ data: { questionId: q3.id, text: "71%" } }),
    prisma.option.create({ data: { questionId: q3.id, text: "81%" } }),
  ]);
  await prisma.question.update({ where: { id: q3.id }, data: { correctOptionId: q3opts[2].id } });

  const q4 = await prisma.question.create({
    data: { assessmentId: assessment1.id, text: "The Indian Ocean Dipole (IOD) affects which weather system?" },
  });
  const q4opts = await Promise.all([
    prisma.option.create({ data: { questionId: q4.id, text: "Arctic Oscillation" } }),
    prisma.option.create({ data: { questionId: q4.id, text: "Indian Monsoon" } }),
    prisma.option.create({ data: { questionId: q4.id, text: "El Niño" } }),
    prisma.option.create({ data: { questionId: q4.id, text: "Jet Stream" } }),
  ]);
  await prisma.question.update({ where: { id: q4.id }, data: { correctOptionId: q4opts[1].id } });

  const q5 = await prisma.question.create({
    data: { assessmentId: assessment1.id, text: "Which instrument measures ocean salinity?" },
  });
  const q5opts = await Promise.all([
    prisma.option.create({ data: { questionId: q5.id, text: "Barometer" } }),
    prisma.option.create({ data: { questionId: q5.id, text: "CTD Profiler" } }),
    prisma.option.create({ data: { questionId: q5.id, text: "Seismograph" } }),
    prisma.option.create({ data: { questionId: q5.id, text: "Anemometer" } }),
  ]);
  await prisma.question.update({ where: { id: q5.id }, data: { correctOptionId: q5opts[1].id } });

  console.log("  ✓ Assessments & questions created");

  // ─── Certificates ───
  await prisma.certificate.create({
    data: {
      userId: trainee1.id,
      courseId: course2.id,
      hash: "CC2024-A7F2-3B9E",
      validatedByAdmin: true,
      issuedAt: new Date("2024-08-20"),
    },
  });
  await prisma.certificate.create({
    data: {
      userId: trainee3.id,
      courseId: course3.id,
      hash: "CC2024-D4E1-9C3D",
      validatedByAdmin: false,
      issuedAt: new Date("2024-09-01"),
    },
  });

  console.log("  ✓ Certificates created");

  // ─── Forum ───
  const thread1 = await prisma.forumThread.create({
    data: {
      courseId: course1.id,
      authorId: trainee1.id,
      title: "How does thermohaline circulation affect Indian Ocean currents?",
      body: "I'm trying to understand the connection between thermohaline circulation and the seasonal reversal of currents in the Indian Ocean. Can anyone explain the mechanism?",
      isQuestion: true,
      upvotes: 12,
    },
  });

  const reply1 = await prisma.forumReply.create({
    data: {
      threadId: thread1.id,
      authorId: trainer1.id,
      body: "Great question! The thermohaline circulation in the Indian Ocean is unique because it's heavily influenced by the monsoon system. During summer, the southwest monsoon drives the Somali Current northward, while in winter it reverses. This seasonal reversal is linked to surface temperature and salinity changes driven by monsoon rainfall and evaporation patterns.",
      upvotes: 8,
    },
  });

  await prisma.forumThread.update({
    where: { id: thread1.id },
    data: { acceptedReplyId: reply1.id },
  });

  await prisma.forumReply.create({
    data: {
      threadId: thread1.id,
      authorId: trainee2.id,
      body: "This was really helpful! I also found the INCOIS website has great visualizations of these current patterns. Check out their Ocean State Forecast page.",
      upvotes: 3,
    },
  });

  const thread2 = await prisma.forumThread.create({
    data: {
      courseId: course1.id,
      authorId: trainee2.id,
      title: "Best Python libraries for oceanographic data analysis?",
      body: "I'm starting my research project and need to process CTD data. What Python libraries do you all recommend for oceanographic data analysis?",
      isQuestion: true,
      upvotes: 7,
    },
  });

  await prisma.forumReply.create({
    data: {
      threadId: thread2.id,
      authorId: trainer1.id,
      body: "For CTD data, I recommend: 1) gsw (Gibbs SeaWater) for thermodynamic calculations, 2) xarray for multidimensional data, 3) cartopy for mapping, 4) pandas for tabular data. These are all used in our lab daily.",
      upvotes: 11,
    },
  });

  console.log("  ✓ Forum threads & replies created");

  // ─── Feedback ───
  await prisma.feedback.create({ data: { userId: trainee1.id, courseId: course1.id, rating: 5, comment: "Excellent course!" } });
  await prisma.feedback.create({ data: { userId: trainee2.id, courseId: course1.id, rating: 4, comment: "Very informative" } });
  await prisma.feedback.create({ data: { userId: trainee1.id, courseId: course2.id, rating: 5, comment: "Outstanding content" } });
  await prisma.feedback.create({ data: { userId: trainee3.id, courseId: course3.id, rating: 4, comment: "Good practical examples" } });

  console.log("  ✓ Feedback created");

  // ─── Notifications ───
  const notifs = [
    { userId: trainee1.id, type: "quiz", message: "Quiz deadline approaching: Oceanography Mid-Term — due Oct 1", read: false },
    { userId: trainee1.id, type: "reply", message: 'Dr. Rajesh Kumar replied to your thread "How does thermohaline circulation..."', read: false },
    { userId: trainee1.id, type: "certificate", message: "Your certificate for Climate Change & Earth Systems has been validated!", read: true },
    { userId: trainee1.id, type: "announcement", message: "New course available: Deep Sea Exploration Techniques", read: true },
    { userId: admin.id, type: "announcement", message: "New trainer registration: Dr. Sunita Rao is awaiting approval.", read: false },
  ];

  for (const n of notifs) {
    await prisma.notification.create({ data: n });
  }
  console.log("  ✓ Notifications created");

  // ─── Announcements ───
  await prisma.announcement.create({
    data: {
      title: "New Course: Deep Sea Exploration Techniques",
      body: "Explore the depths! Our new advanced course on deep sea exploration is now available for enrollment.",
      type: "announcement",
      icon: "🌊",
      publishedBy: admin.id,
    },
  });
  await prisma.announcement.create({
    data: {
      title: "Priya Sharma completes Climate Science certification",
      body: "Congratulations to Priya Sharma for achieving certification in Climate Change & Earth Systems!",
      type: "achievement",
      icon: "🏆",
      publishedBy: admin.id,
    },
  });
  await prisma.announcement.create({
    data: {
      title: "Platform maintenance scheduled — Sept 15",
      body: "The platform will undergo scheduled maintenance on September 15 from 2:00 AM to 4:00 AM IST.",
      type: "notification",
      icon: "🔧",
      publishedBy: admin.id,
    },
  });

  console.log("  ✓ Announcements created");

  // ─── Competency Map ───
  const competencies = [
    { trainerId: trainer1.id, skills: ["Marine Biology", "Oceanography", "Python", "CTD Operations"] },
    { trainerId: trainer2.id, skills: ["Climate Modeling", "GIS", "Remote Sensing", "R Programming"] },
    { trainerId: trainer3.id, skills: ["Meteorology", "Weather Prediction", "Satellite Data", "Atmospheric Physics"] },
  ];

  for (const comp of competencies) {
    for (const skill of comp.skills) {
      await prisma.competencyMap.create({
        data: { trainerId: comp.trainerId, skillTag: skill, verifiedByAdmin: true },
      });
    }
  }
  console.log("  ✓ Competency map created");

  // ─── Reports (moderation) ───
  await prisma.report.create({
    data: {
      contentType: "forum_reply",
      contentId: "demo",
      reportedBy: trainee3.id,
      reportedUser: "Unknown",
      reason: "Spam",
      status: "pending",
      courseContext: "Introduction to Oceanography",
    },
  });

  console.log("  ✓ Reports created");
  console.log("\n✅ Seed complete!\n");
  console.log("Demo accounts (all password: password123):");
  console.log("  Admin:   admin@moes.gov.in");
  console.log("  Trainer: rajesh@moes.gov.in  |  meera@moes.gov.in  |  vikram@moes.gov.in");
  console.log("  Trainee: priya@moes.gov.in   |  amit@moes.gov.in   |  sneha@moes.gov.in");
  console.log("  Pending: sunita@moes.gov.in (trainer, awaiting approval)");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
