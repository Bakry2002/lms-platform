import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

const CoursesPage = () => {
    return (
        <div className="p-6">
            <Link href="/teacher/create" className={buttonVariants()}>
                New Course
            </Link>
        </div>
    );
};

export default CoursesPage;
