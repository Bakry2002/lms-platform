import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function PUT(
    req: Request,
    { params }: { params: { courseId: string } },
) {
    try {
        // extract the courseId from the params object
        const { courseId } = params;
        // get the userId
        const { userId } = auth();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // get the list of chapters from the request json
        const { list } = await req.json();

        // check if the owner of the course is the same as the user
        const courseOwner = await db.course.findUnique({
            where: { id: courseId, userId: userId },
        });

        if (!courseOwner) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // ready to update the chapters
        for (let item of list) {
            await db.chapter.update({
                where: { id: item.id },
                data: { position: item.position },
            });
        }

        return new NextResponse('Success', { status: 200 });
    } catch (error) {
        console.log(
            '[ERROR] app/api/courses/[courseId]/chapters/reorder/route.ts',
        );
        return new NextResponse('Internal server error', { status: 500 });
    }
}
