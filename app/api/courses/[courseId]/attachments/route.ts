import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(
    req: Request,
    { params }: { params: { courseId: string } },
) {
    try {
        const { userId } = auth();
        // get the course id from the request
        const { courseId } = params;

        // extract the url from the request
        const { url } = await req.json();

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // check if the owner of this course is the current user trying to add an attachment
        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                userId,
            },
        });

        if (!courseOwner) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const attachment = await db.attachment.create({
            data: {
                url,
                name: url.split('/').pop(), // get the last part of the url
                courseId,
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.log('[courseId] [attachments] route: ', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
