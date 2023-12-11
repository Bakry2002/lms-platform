import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { Chapter, Course, UserProgress } from '@prisma/client';
import { redirect } from 'next/navigation';
import { CourseSidebarItem } from './course-sidebar-item';

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
            userId_courseId: {
                // use composite key to find the purchase that matches the current user and course
                courseId: course.id,
                userId,
            },
        },
    });
    return (
        <div className="flex h-full flex-col overflow-y-auto border-r shadow-sm">
            <div className="flex flex-col border-b p-8">
                <h1 className="font-semibold">{course.title}</h1>
                {/* Check purchase & add progress  */}
            </div>
            <div className="flex w-full flex-col">
                {course.chapters.map((chapter) => (
                    <CourseSidebarItem
                        key={chapter.id}
                        id={chapter.id}
                        label={chapter.title}
                        isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                        courseId={course.id}
                        isLocked={!chapter.isFree && !purchase}
                    />
                ))}
            </div>
        </div>
    );
};
