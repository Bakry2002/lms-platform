import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { Chapter, Course, UserProgress } from '@prisma/client';
import { redirect } from 'next/navigation';

interface CourseSidebarProps {
    course: Course & {
        chapters: (Chapter & {
            userProgress: UserProgress[] | null;
        })[];
    };
    progressCount: number;
}
export const CourseSidebar = async ({
    course,
    progressCount,
}: CourseSidebarProps) => {
    const { userId } = auth();

    if (!userId) {
        return redirect('/');
    }

    // get the purchase for this course for the current user
    const purchase = await db.purchase.findUnique({
        where: {
            courseId_userId: {
                courseId: course.id,
                userId,
            },
        },
    });
    return <div>Sidebar</div>;
};
