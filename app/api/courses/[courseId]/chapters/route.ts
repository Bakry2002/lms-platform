import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: { courseId: string } },
) {
    try {
        // extract courseId from params
        const { courseId } = params;
        // get the userId from the auth object
        const { userId } = auth();

        //extract the course title from the request body
        const { title } = await req.json();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        //check if the owner of the course is the same as the user
        const courseOwner = await db.course.findUnique({
            where: { id: courseId, userId },
        });

        if (!courseOwner) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // before adding a chapter, we need to know the order (position) of the last chapter
        const lastChapter = await db.chapter.findFirst({
            where: { courseId },
            orderBy: { position: 'desc' }, // descending order to get the last chapter created
        });

        const newPosition = lastChapter ? lastChapter.position + 1 : 1; // if there is no last chapter, then the position is 1

        // now, we can create the chapter
        const chapter = await db.chapter.create({
            data: {
                title,
                courseId,
                position: newPosition,
            },
        });

        return NextResponse.json(chapter);
    } catch (error) {
        console.log('[ERROR] POST /api/courses/[courseId]/chapters', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
