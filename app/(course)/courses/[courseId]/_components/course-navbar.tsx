import NavbarRoutes from '@/components/navbar-routes';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { Chapter, Course, UserProgress } from '@prisma/client';
import { redirect } from 'next/navigation';
import { CourseMobileSidebar } from './course-mobile-sidebar';

export interface CourseNavbarProps {
    course: Course & {
        chapters: (Chapter & {
            userProgress: UserProgress[] | null;
        })[];
    };
    progressCount: number;
}

export const CourseNavbar = async ({
    course,
    progressCount,
}: CourseNavbarProps) => {
    const { userId } = auth();

    if (!userId) {
        return redirect('/');
    }

    return (
        <div className="flex h-full items-center border-b bg-white p-4 shadow-sm">
            <CourseMobileSidebar
                course={course}
                progressCount={progressCount}
            />
            <NavbarRoutes />
        </div>
    );
};
