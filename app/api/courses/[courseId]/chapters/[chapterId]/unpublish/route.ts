import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string; chapterId: string } },
) {
    try {
        const { courseId, chapterId } = params;
        const { userId } = auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const courseOwner = await db.course.findUnique({
            where: { id: courseId, userId },
        });

        if (!courseOwner) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const unpublishedChapter = await db.chapter.update({
            where: { id: chapterId, courseId },
            data: {
                isPublished: false,
            },
        });

        // if this unpublished chapter is the only chapter in the course, then we need to unpublish the course as well
        const publishedChapterInCourse = await db.chapter.findMany({
            where: { courseId, isPublished: true },
        });

        if (!publishedChapterInCourse.length) {
            await db.course.update({
                where: { id: courseId },
                data: {
                    isPublished: false,
                },
            });
        }

        return NextResponse.json(unpublishedChapter);
    } catch (error) {
        console.log(
            '[ERROR] PATCH /api/courses/[courseId]/chapters/[chapterId]/unpublish',
            error,
        );
        return new NextResponse('Internal server error', {
            status: 500,
        });
    }
}
