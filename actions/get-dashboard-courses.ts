import { db } from '@/lib/db';
import { Category, Chapter, Course } from '@prisma/client';
import { getProgress } from './get-progress';

type CourseWithProgressWithCategory = Course & {
    category: Category;
    chapters: Chapter[];
    progress: number | null;
};

type DashboardCourses = {
    completedCourses: CourseWithProgressWithCategory[];
    coursesInProgress: CourseWithProgressWithCategory[];
};

export const getDashboardCourses = async (
    userId: string,
): Promise<DashboardCourses> => {
    try {
        const purchasedCourses = await db.purchase.findMany({
            where: {
                userId,
            },
            select: {
                course: {
                    include: {
                        category: true,
                        chapters: {
                            where: {
                                isPublished: true,
                            },
                        },
                    },
                },
            },
        });

        // map the purchased courses to an array of courses
        const courses = purchasedCourses.map(
            (purchase) => purchase.course,
        ) as CourseWithProgressWithCategory[];

        // get progress of each course and add it to the course object
        for (let course of courses) {
            const progress = await getProgress(userId, course.id);
            course['progress'] = progress;
        }

        // separate courses into completed and in progress
        const completedCourses = courses.filter(
            (course) => course.progress === 100,
        );
        const coursesInProgress = courses.filter(
            (course) => (course.progress ?? 0) < 100, // ?? 0 is to handle null progress
        );

        return {
            completedCourses,
            coursesInProgress,
        };
    } catch (error) {
        console.log('[ERROR] getDashboardCourses: ', error);
        return {
            completedCourses: [],
            coursesInProgress: [],
        };
    }
};
