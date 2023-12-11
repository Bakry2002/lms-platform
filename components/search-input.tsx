'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import qs from 'query-string';

interface SearchInputProps {}

const SearchInput: React.FC<SearchInputProps> = ({}) => {
    const [value, setValue] = useState('');
    const debounceValue = useDebounce(value);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const currentCategoryId = searchParams.get('categoryId');

    useEffect(() => {
        const url = qs.stringifyUrl(
            {
                url: pathname,
                query: {
                    categoryId: currentCategoryId,
                    title: debounceValue,
                },
            },
            { skipEmptyString: true, skipNull: true },
        );

        router.push(url);
    }, [debounceValue, currentCategoryId, router, pathname]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-full bg-slate-100 pl-9 focus-visible:ring-slate-200 md:w-[300px]"
                placeholder="Search for courses..."
            />
        </div>
    );
};

export default SearchInput;
