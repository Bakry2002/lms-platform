'use client';

import Image from 'next/image';
import Link from 'next/link';
import { IconBadge } from './icon-badge';
import { BookOpen } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { CourseProgress } from './course-progress';

interface CourseCardProps {
    id: string;
    title: string;
    imageUrl: string;
    chapterLength: number;
    price: number;
    category: string;
    progress: number | null;
}
export const CourseCard = ({
    id,
    title,
    imageUrl,
    chapterLength,
    progress,
    price,
    category,
}: CourseCardProps) => {
    return (
        <Link href={`/courses/${id}`}>
            <div className="group h-full overflow-hidden rounded-lg border p-3 transition hover:shadow-sm">
                <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col pt-2">
                    <div className="line-clamp-2 text-lg font-medium transition group-hover:text-sky-700 md:text-base">
                        {title}
                    </div>
                    <p className="text-xs text-muted-foreground">{category}</p>
                    <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
                        <div className="flex items-center gap-x-1 text-slate-500">
                            <IconBadge icon={BookOpen} size="sm" />
                            <span>
                                {chapterLength}{' '}
                                {chapterLength > 1 ? 'chapters' : 'chapter'}
                            </span>
                        </div>
                    </div>

                    {progress !== null ? (
                        <CourseProgress
                            value={progress}
                            size="sm"
                            variant={progress === 100 ? 'success' : 'default'}
                        />
                    ) : (
                        <p className="text-md font-medium text-slate-700 md:text-sm">
                            {formatPrice(price)}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};
