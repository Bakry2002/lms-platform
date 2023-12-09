import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string; chapterId: string } },
) {
    try {
        const { courseId, chapterId } = params;

        // get userId from session
        const { userId } = auth();
        // get all values from request body
        const { isPublished, ...values } = await req.json();

        if (!userId) {
            return new NextResponse('Unauthorized', {
                status: 401,
            });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                userId,
            },
        });

        if (!courseOwner) {
            return new NextResponse('Unauthorized', {
                status: 401,
            });
        }

        const chapter = await db.chapter.update({
            where: {
                id: chapterId,
                courseId,
            },
            data: {
                ...values,
            },
        });

        // TODO: Handle video upload

        return NextResponse.json(chapter);
    } catch (error) {
        console.log(
            '[ERROR] courses/[courseId]/chapters/[chapterId]/route.ts',
            error,
        );
        return new NextResponse('Internal server error', {
            status: 500,
        });
    }
}
