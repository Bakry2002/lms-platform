import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string } },
) {
    try {
        // extract the userId
        const { userId } = auth();
        const { courseId } = params;
        const value = await req.json(); // get the body of the request

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const course = await db.course.update({
            where: { id: courseId, userId },
            data: {
                ...value,
                updatedAt: new Date().toISOString(),
            },
        });

        return NextResponse.json(course);
    } catch (error) {
        console.log('[Courses] [PATCH] [/api/courses/[courseId]]', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
