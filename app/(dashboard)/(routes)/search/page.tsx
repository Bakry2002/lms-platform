import { db } from '@/lib/db';
import Categories from './_components/categories';
import SearchInput from '@/components/search-input';
import { getCourses } from '@/actions/get-courses';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { CoursesList } from '@/components/courses-list';

interface PageProps {
    searchParams: {
        title: string;
        categoryId: string;
    };
}

const Page = async ({ searchParams }: PageProps) => {
    const { userId } = auth();

    if (!userId) {
        return redirect('/');
    }

    // get all categories
    const categories = await db.category.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    const courses = await getCourses({ userId, ...searchParams });

    return (
        <>
            <div className="block px-6 pt-6 md:mb-0 md:hidden">
                <SearchInput />
            </div>
            <div className="space-y-4 p-6">
                <Categories items={categories} />
                <CoursesList items={courses} />
            </div>
        </>
    );
};

export default Page;
