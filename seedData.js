import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from './Model/userModel.js';
import ProgressModel from './Model/Progress.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDatabase = async () => {
    try {
        // الاتصال بقاعدة البيانات
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // حذف البيانات القديمة (اختياري - للبدء من جديد)
        await userModel.deleteMany({});
        await ProgressModel.deleteMany({});
        console.log('🗑️ Old data cleared');

        // ============================================
        // 1. إنشاء مستخدمين تجريبيين
        // ============================================
        const salt = await bcrypt.genSalt(10);
        
        const users = await userModel.create([
            {
                userName: "Ahmed",
                email: "ahmed@example.com",
                password: await bcrypt.hash("123456", salt),
                role: "student"
            },
            {
                userName: "Sarah",
                email: "sarah@example.com",
                password: await bcrypt.hash("123456", salt),
                role: "student"
            },
            {
                userName: "Youssef",
                email: "youssef@example.com",
                password: await bcrypt.hash("123456", salt),
                role: "student"
            },
            {
                userName: "Leila",
                email: "leila@example.com",
                password: await bcrypt.hash("123456", salt),
                role: "student"
            },
            {
                userName: "Omar",
                email: "omar@example.com",
                password: await bcrypt.hash("123456", salt),
                role: "student"
            }
        ]);
        console.log(`✅ Created ${users.length} users`);

        // ============================================
        // 2. الحصول على ID المستخدمين
        // ============================================
        const ahmed = users.find(u => u.userName === "Ahmed");
        const sarah = users.find(u => u.userName === "Sarah");
        const youssef = users.find(u => u.userName === "Youssef");
        const leila = users.find(u => u.userName === "Leila");
        const omar = users.find(u => u.userName === "Omar");

        // ============================================
        // 3. إنشاء سجلات التقدم (Progress) لكل مستخدم
        // ============================================
        
        // تاريخ اليوم
        const today = new Date();
        const twoDaysAgo = new Date(today);
        twoDaysAgo.setDate(today.getDate() - 2);
        const fiveDaysAgo = new Date(today);
        fiveDaysAgo.setDate(today.getDate() - 5);
        
        // --- تقدم أحمد (المستخدم الحالي) ---
        const ahmedProgress = [
            // Course 1: Full-Stack Development
            { userId: ahmed._id, courseId: 1, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fiveDaysAgo },
            { userId: ahmed._id, courseId: 1, lessonId: 2, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fourDaysAgo },
            { userId: ahmed._id, courseId: 1, lessonId: 3, progress: 60, completed: false, pointsEarned: 60, lastUpdated: twoDaysAgo },
            { userId: ahmed._id, courseId: 1, lessonId: 4, progress: 45, completed: false, pointsEarned: 45, lastUpdated: today },
            // Course 2: Python for Data Science
            { userId: ahmed._id, courseId: 2, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: sixDaysAgo },
            { userId: ahmed._id, courseId: 2, lessonId: 2, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fiveDaysAgo },
            { userId: ahmed._id, courseId: 2, lessonId: 3, progress: 70, completed: false, pointsEarned: 70, lastUpdated: twoDaysAgo },
            // Course 3: Flutter
            { userId: ahmed._id, courseId: 3, lessonId: 1, progress: 50, completed: false, pointsEarned: 50, lastUpdated: today }
        ];
        
        // --- تقدم سارة (المركز الأول في Leaderboard) ---
        const sarahProgress = [
            { userId: sarah._id, courseId: 1, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: sevenDaysAgo },
            { userId: sarah._id, courseId: 1, lessonId: 2, progress: 100, completed: true, pointsEarned: 100, lastUpdated: sixDaysAgo },
            { userId: sarah._id, courseId: 1, lessonId: 3, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fiveDaysAgo },
            { userId: sarah._id, courseId: 1, lessonId: 4, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fourDaysAgo },
            { userId: sarah._id, courseId: 1, lessonId: 5, progress: 90, completed: false, pointsEarned: 90, lastUpdated: twoDaysAgo },
            { userId: sarah._id, courseId: 2, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: sixDaysAgo },
            { userId: sarah._id, courseId: 2, lessonId: 2, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fiveDaysAgo },
            { userId: sarah._id, courseId: 2, lessonId: 3, progress: 100, completed: true, pointsEarned: 100, lastUpdated: threeDaysAgo },
            { userId: sarah._id, courseId: 2, lessonId: 4, progress: 80, completed: false, pointsEarned: 80, lastUpdated: today }
        ];
        
        // --- تقدم يوسف ---
        const youssefProgress = [
            { userId: youssef._id, courseId: 1, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: sixDaysAgo },
            { userId: youssef._id, courseId: 1, lessonId: 2, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fiveDaysAgo },
            { userId: youssef._id, courseId: 1, lessonId: 3, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fourDaysAgo },
            { userId: youssef._id, courseId: 1, lessonId: 4, progress: 60, completed: false, pointsEarned: 60, lastUpdated: twoDaysAgo },
            { userId: youssef._id, courseId: 2, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fiveDaysAgo },
            { userId: youssef._id, courseId: 2, lessonId: 2, progress: 85, completed: false, pointsEarned: 85, lastUpdated: today }
        ];
        
        // --- تقدم ليلى ---
        const leilaProgress = [
            { userId: leila._id, courseId: 1, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: sixDaysAgo },
            { userId: leila._id, courseId: 1, lessonId: 2, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fiveDaysAgo },
            { userId: leila._id, courseId: 1, lessonId: 3, progress: 70, completed: false, pointsEarned: 70, lastUpdated: threeDaysAgo },
            { userId: leila._id, courseId: 2, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: fourDaysAgo }
        ];
        
        // --- تقدم عمر ---
        const omarProgress = [
            { userId: omar._id, courseId: 1, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: sevenDaysAgo },
            { userId: omar._id, courseId: 1, lessonId: 2, progress: 80, completed: false, pointsEarned: 80, lastUpdated: fiveDaysAgo },
            { userId: omar._id, courseId: 2, lessonId: 1, progress: 100, completed: true, pointsEarned: 100, lastUpdated: sixDaysAgo }
        ];
        
        // دمج جميع سجلات التقدم
        const allProgress = [
            ...ahmedProgress,
            ...sarahProgress,
            ...youssefProgress,
            ...leilaProgress,
            ...omarProgress
        ];
        
        await ProgressModel.create(allProgress);
        console.log(`✅ Created ${allProgress.length} progress records`);
        
        console.log('\n🎉 Database seeded successfully!');
        console.log('=====================================');
        console.log('📝 Test User Credentials:');
        console.log('   Email: ahmed@example.com');
        console.log('   Password: 123456');
        console.log('=====================================');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();