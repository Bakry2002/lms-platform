import { db } from '@/lib/db';
import { Category, Course } from '@prisma/client';
import { getProgress } from './get-progress';

export type CourseWithProgressWithCategory = Course & {
    category: Category | null;
    chapters: { id: string }[];
    progress: number | null;
};

type GetCourses = {
    userId: string;
    title?: string;
    categoryId?: string;
};

export const getCourses = async ({
    userId,
    title,
    categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
    try {
        // get courses
        const courses = await db.course.findMany({
            where: {
                isPublished: true,
                title: {
                    contains: title,
                },
                categoryId,
            },
            include: {
                category: true,
                chapters: {
                    where: {
                        isPublished: true,
                    },
                    select: {
                        id: true,
                    },
                },
                purchases: {
                    where: {
                        userId,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const coursesWithProgress: CourseWithProgressWithCategory[] =
            await Promise.all(
                courses.map(async (course) => {
                    // check if user has purchased this course
                    if (course.purchases.length === 0) {
                        return {
                            // if not purchased, return course without progress
                            ...course,
                            progress: null,
                        };
                    }

                    const progressPercentage = await getProgress(
                        userId,
                        course.id,
                    );

                    return {
                        ...course,
                        progress: progressPercentage,
                    };
                }),
            );

        return coursesWithProgress;
    } catch (error) {
        console.log('[ERROR] getCourses: ', error);
        return [];
    }
};
