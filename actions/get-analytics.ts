import { db } from '@/lib/db';
import { Course, Purchase } from '@prisma/client';

type PurchaseWithCourse = Purchase & {
    course: Course;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
    const grouped: { [courseTitle: string]: number } = {};

    purchases.forEach((purchase) => {
        const courseTitle = purchase.course.title;
        if (!grouped[courseTitle]) {
            grouped[courseTitle] = 0;
        }
        grouped[courseTitle] += purchase.course.price!;
    });

    return grouped;
};

export const getAnalytics = async (userId: string) => {
    try {
        const purchase = await db.purchase.findMany({
            where: {
                course: {
                    userId, // course created by the user
                },
            },
            include: {
                course: true, // include the course object
            },
        });

        // how much each course has earned
        const groupedEarnings = groupByCourse(purchase);

        const data = Object.entries(groupedEarnings).map(
            ([courseTitle, total]) => ({
                name: courseTitle,
                total: total,
            }),
        );

        const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0); // total revenue
        const totalSales = purchase.length; // total number of purchases

        return {
            data,
            totalRevenue,
            totalSales,
        };
    } catch (error) {
        console.log('[ERROR] getAnalytics: ', error);
        return {
            data: [],
            totalRevenue: 0,
            totalSales: 0,
        };
    }
};
