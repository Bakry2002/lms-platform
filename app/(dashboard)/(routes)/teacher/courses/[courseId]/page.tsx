import { IconBadge } from '@/components/icon-badge';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { LayoutDashboard } from 'lucide-react';
import { redirect } from 'next/navigation';
import TitleForm from './_components/title-form';
import DescriptionForm from './_components/description-form';
import ImageForm from './_components/image-form';

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

    // get all categories from database
    const categories = await db.category.findMany({
        orderBy: { name: 'asc' },
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

    const completionText = `(${completedField}/${totalFields})`;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-2">
                    <h1 className="text-2xl font-medium">Course setup</h1>
                    <span className="text-sm text-muted-foreground">
                        Complete all fields {completionText}
                    </span>
                </div>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <div className="flex items-center gap-x-2">
                        <IconBadge icon={LayoutDashboard} />
                        <h2 className="text-xl">Customize your course</h2>
                    </div>
                    <TitleForm initialData={course} courseId={course.id} />
                    <DescriptionForm
                        initialData={course}
                        courseId={course.id}
                    />
                    <ImageForm initialData={course} courseId={course.id} />
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
