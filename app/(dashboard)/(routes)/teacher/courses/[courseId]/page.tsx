import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface CourseDetailPageProps {
    params: {
        courseId: string;
    };
}

const CourseDetailPage = async ({ params }: CourseDetailPageProps) => {
    const { courseId } = params; //  get courseId from params

    // extract the userId to see if the user is the owner of the course
    const { userId } = auth();

    if (!userId) {
        return redirect('/');
    }

    // get equivalent course from database
    const course = await db.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        return redirect('/');
    }

    const requiredField = [
        course?.title,
        course?.description,
        course?.imageUrl,
        course?.price,
        course?.categoryId,
    ];
    const totalFields = requiredField.length;
    const completedField = requiredField.filter(Boolean).length; // count the number of fields that are not null

    const completionText = `${completedField} / ${totalFields}`;

    return <div>Course id {courseId}</div>;
};

export default CourseDetailPage;
