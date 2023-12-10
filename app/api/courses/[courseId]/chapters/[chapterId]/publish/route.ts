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

        // find the chapter we want to publish
        const chapter = await db.chapter.findUnique({
            where: { id: chapterId, courseId },
        });

        // find the mux data for it (videoId, playbackId, etc)
        const muxData = await db.muxData.findUnique({
            where: { chapterId },
        });

        if (
            !chapter ||
            !muxData ||
            !chapter.title ||
            !chapter.description ||
            !chapter.videoUrl
        ) {
            return new NextResponse('Missing required fields', {
                status: 400,
            });
        }

        const publishedChapter = await db.chapter.update({
            where: { id: chapterId, courseId },
            data: {
                isPublished: true,
            },
        });

        return NextResponse.json(publishedChapter);
    } catch (error) {
        console.log(
            '[ERROR] PATCH /api/courses/[courseId]/chapters/[chapterId]/publish',
            error,
        );
        return new NextResponse('Internal server error', {
            status: 500,
        });
    }
}
