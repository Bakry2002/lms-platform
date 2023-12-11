'use client';

import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IconType } from 'react-icons';
import qs from 'query-string';

interface CategoryItemProps {
    label: string;
    value?: string;
    icon?: IconType;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
    label,
    icon: Icon,
    value,
}) => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    // get current category
    const currentCategoryId = searchParams.get('categoryId');
    // get what user searched for
    const CurrentTitle = searchParams.get('title');

    // if category is selected
    const isSelected = currentCategoryId === value;

    const onClick = () => {
        // stringify the url
        const url = qs.stringifyUrl(
            {
                url: pathname,
                query: {
                    title: CurrentTitle,
                    categoryId: isSelected ? null : value, // if category is selected, set it to null, toggle it
                },
            },
            { skipNull: true, skipEmptyString: true },
        );

        router.push(url);
    };
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center gap-x-1 rounded-full border border-slate-200 px-3 py-2 text-sm transition hover:border-sky-700',
                isSelected && 'border-sky-700 bg-sky-200/50 text-sky-800',
            )}
            type="button"
        >
            {Icon && <Icon size={20} />}
            <div className="truncate">{label}</div>
        </button>
    );
};

export default CategoryItem;
