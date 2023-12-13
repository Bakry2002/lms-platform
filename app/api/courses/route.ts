import { isTeacher } from '@/lib/teacher';
import { db } from '../../../lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // extract the user id from clerk auth function
        const { userId } = auth();
        // extract the course title from the request form data
        const { title } = await req.json();

        if (!userId || !isTeacher(userId)) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // attempt to create a new course
        const course = await db.course.create({
            data: {
                userId,
                title,
            },
        });

        return NextResponse.json(course); // return the course as json to get it as a response from the api
    } catch (error) {
        console.log('[COURSES]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
