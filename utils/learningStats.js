function startOfLocalDay(dateInput = new Date()) {
    const date = new Date(dateInput);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDayKey(dateInput) {
    const date = startOfLocalDay(dateInput);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function calculateCurrentStreak(progressRecords = []) {
    const activeDays = new Set(
        progressRecords
            .map(record => record?.lastUpdated || record?.updatedAt || record?.createdAt)
            .filter(Boolean)
            .map(getDayKey)
    );

    if (activeDays.size === 0) {
        return 0;
    }

    const today = startOfLocalDay(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let streak = 0;
    let cursor;

    if (activeDays.has(getDayKey(today))) {
        streak = 1;
        cursor = new Date(today);
        cursor.setDate(cursor.getDate() - 1);
    } else if (activeDays.has(getDayKey(yesterday))) {
        streak = 1;
        cursor = new Date(yesterday);
        cursor.setDate(cursor.getDate() - 1);
    } else {
        return 0;
    }

    while (activeDays.has(getDayKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}

function parseDurationToMinutes(durationText = "") {
    const value = String(durationText).trim().toLowerCase();
    if (!value) return 0;

    const number = parseFloat(value.replace(",", "."));
    if (Number.isNaN(number)) return 0;

    if (value.includes("hour") || value.includes("hr") || value.includes("h")) {
        return Math.round(number * 60);
    }

    return Math.round(number);
}

function formatMinutesAsHoursAndMinutes(totalMinutes = 0) {
    const safeMinutes = Math.max(0, Math.round(totalMinutes));
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;
    return { hours, minutes };
}

function calculateQuizAverage(levelProgressDocs = []) {
    const scores = [];

    for (const doc of levelProgressDocs) {
        if (doc?.placementCompleted) {
            scores.push(Number(doc.placementScore || 0));
        }

        const levelEntries = doc?.levels ? Object.values(doc.levels) : [];
        levelEntries.forEach(level => {
            if ((level?.quizAttempts || 0) > 0) {
                scores.push(Number(level.lastScore || 0));
            }
        });
    }

    if (scores.length === 0) {
        return 0;
    }

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function calculateCourseProgressPercent(course, progressRecords = []) {
    const totalLessons = course?.lessons?.length || 0;
    if (totalLessons === 0) {
        return 0;
    }

    const progressByLesson = new Map();
    progressRecords.forEach(record => {
        progressByLesson.set(String(record.lessonId), Number(record.progress || 0));
    });

    let totalProgress = 0;
    course.lessons.forEach(lesson => {
        totalProgress += progressByLesson.get(String(lesson._id)) || 0;
    });

    return Math.round(totalProgress / totalLessons);
}

function calculateTimeSpentMinutes(course, progressRecords = []) {
    const lessonById = new Map(
        (course?.lessons || []).map(lesson => [String(lesson._id), lesson])
    );

    return progressRecords.reduce((sum, record) => {
        const lesson = lessonById.get(String(record.lessonId));
        const lessonMinutes = parseDurationToMinutes(lesson?.duration || "");
        const progressRatio = Math.max(0, Math.min(100, Number(record.progress || 0))) / 100;
        return sum + (lessonMinutes * progressRatio);
    }, 0);
}

export {
    calculateCurrentStreak,
    calculateQuizAverage,
    calculateCourseProgressPercent,
    calculateTimeSpentMinutes,
    formatMinutesAsHoursAndMinutes,
    parseDurationToMinutes
};
