import { auth } from '@clerk/nextjs';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
    req: Request,
    { params }: { params: { attachmentId: string; courseId: string } },
) {
    try {
        // get user id from the request
        const { userId } = auth();

        // destruct the attachment id from the request
        const { attachmentId, courseId } = params;

        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // check if the owner of this course is the current user trying to delete an attachment
        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                userId,
            },
        });

        if (!courseOwner) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // delete the attachment
        const attachment = await db.attachment.delete({
            where: {
                id: attachmentId,
                courseId,
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.log('[courseId] [attachments] [attachmentId] route: ', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
