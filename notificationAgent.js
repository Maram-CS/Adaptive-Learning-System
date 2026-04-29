import "dotenv/config";
import mongoose from "mongoose";
import Notification from "./Model/notificationModel.js";
import userModel from "./Model/userModel.js";
import progressLevelModel from "./Model/progressLevelModel.js";

function getLatestLevelScore(levels = {}) {
  const attemptedLevels = Object.values(levels).filter(
    (level) =>
      level &&
      Number.isFinite(level.lastScore) &&
      (level.quizAttempts ?? 0) > 0
  );

  if (attemptedLevels.length === 0) return null;

  attemptedLevels.sort((a, b) => {
    const aTime = a.lastAttemptAt ? new Date(a.lastAttemptAt).getTime() : 0;
    const bTime = b.lastAttemptAt ? new Date(b.lastAttemptAt).getTime() : 0;
    if (bTime !== aTime) return bTime - aTime;
    return (b.quizAttempts ?? 0) - (a.quizAttempts ?? 0);
  });

  return attemptedLevels[0].lastScore;
}

async function getRealLastScore(userId) {
  const latestProgress = await progressLevelModel
    .findOne({ userId })
    .sort({ updatedAt: -1 })
    .select("levels updatedAt");

  if (!latestProgress) return null;
  return getLatestLevelScore(latestProgress.levels);
}

function getStudentStats(student) {
  const lastLogin = student.lastLogin ?? student.createdAt ?? new Date();
  const daysAbsent = Math.floor((Date.now() - new Date(lastLogin)) / 86400000);

  return {
    daysAbsent,
    pendingTasks: student.pendingTasks ?? 0,
    completedToday: student.completedToday ?? false,
    userName: student.userName,
  };
}

async function runAgentForStudent(student, stats, realScore) {
  console.log(`Analyzing: ${student.userName}...`);

  if (realScore !== null && realScore < 50) {
    return {
      send: true,
      title: "Oops! Quiz attempt did not go well.",
      body: `You scored ${realScore}%. Let me help you review the tricky parts.`,
      emoji: "📖",
      reason: `Real score ${realScore}% (below 50%).`,
    };
  } else if (stats.daysAbsent > 1) {
    return {
      send: true,
      title: `Hey ${student.userName}, we miss you!`,
      body: `You have not logged in for ${stats.daysAbsent} days.`,
      emoji: "👋",
      reason: "Inactive for more than a week.",
    };
  } else if (realScore !== null && realScore < 60) {
    return {
      send: true,
      title: "Need help with your studies?",
      body: `Your last score was ${realScore}%. Let's review it together!`,
      emoji: "💪",
      reason: `Real score ${realScore}% (below 60%).`,
    };
  } else if (stats.pendingTasks > 2) {
    return {
      send: true,
      title: `You have ${stats.pendingTasks} pending tasks!`,
      body: "Time to catch up? I can help you plan your study session.",
      emoji: "🎯",
      reason: "Student has pending tasks.",
    };
  } else {
    return {
      send: false,
      title: "",
      body: "",
      emoji: "",
      reason: "Student is on track.",
    };
  }
}

async function runNotificationAgent() {
  await mongoose.connect(process.env.nameDb);
  console.log("Connected to MongoDB. Agent starting...");

  const students = await userModel.find({ role: "student" });
  console.log(`Found ${students.length} student(s) to analyze.`);

  let sent = 0;

  for (const student of students) {
    const stats = getStudentStats(student);
    const realScore = await getRealLastScore(student._id);

    console.log(
      `${student.userName} -> realScore: ${realScore}, pendingTasks: ${stats.pendingTasks}, daysAbsent: ${stats.daysAbsent}`
    );

    const notif = await runAgentForStudent(student, stats, realScore);

    if (notif.send) {
      await Notification.create({
        studentId: student._id,
        type: "ai",
        title: notif.title,
        message: notif.body,
        emoji: notif.emoji,
      });
      console.log(`Sent to ${student.userName}: ${notif.title}`);
      sent++;
    } else {
      console.log(`Skipped ${student.userName} - ${notif.reason}`);
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`Done! Sent: ${sent} | Skipped: ${students.length - sent}`);
  await mongoose.disconnect();
}

runNotificationAgent();