import { getProgress } from '@/actions/get-progress';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { CourseSidebar } from './_components/course-sidebar';

const CourseLayout = async ({
    children,
    params,
}: {
    children: React.ReactNode;
    params: {
        courseId: string;
    };
}) => {
    const { userId } = auth();

    if (!userId) {
        return redirect('/');
    }

    // get the course we trying to load
    const course = await db.course.findUnique({
        where: {
            id: params.courseId,
        },
        include: {
            chapters: {
                where: {
                    isPublished: true, // only include published chapters
                },
                include: {
                    userProgress: {
                        where: {
                            userId, // only include the user progress for the current user
                        },
                    },
                },
                orderBy: {
                    position: 'asc', // order chapters by position
                },
            },
        },
    });

    if (!course) {
        return redirect('/');
    }

    // get progress count for the course
    const progressCount = await getProgress(userId, course.id);

    return (
        <div className="h-full">
            <div className="fixed inset-y-0 z-50 hidden h-full w-80 flex-col md:flex">
                <CourseSidebar course={course} progressCount={progressCount} />
            </div>
            <main className="h-full md:pl-80">{children}</main>
        </div>
    );
};

export default CourseLayout;
