'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

type SidebarItemProps = {
    label: string;
    icon: LucideIcon;
    href: string;
};

const SidebarItem = ({ label, icon: Icon, href }: SidebarItemProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const isActive =
        (pathname === '/' && href === '/') ||
        pathname === href ||
        pathname?.startsWith(`${href}/`);
    // active path if the current pathname is the root path
    // or the current pathname is the same as the href
    // or the current pathname starts with the href sub path of specific route

    const onClick = () => {
        router.push(href);
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex items-center gap-x-2 pl-6 text-sm font-[500] text-slate-500 transition-all hover:bg-slate-300/20 hover:text-slate-600',
                isActive &&
                    'bg-sky-200/20 text-sky-700 hover:bg-sky-200/20 hover:text-sky-700',
            )}
        >
            <div className="flex items-center gap-x-2 py-4">
                <Icon
                    size={22}
                    className={cn('text-slate-500', isActive && 'text-sky-700')}
                />
                {label}
            </div>
            <div
                aria-hidden="true"
                className={cn(
                    'ml-auto h-full border-2 border-sky-700 opacity-0 transition-all',
                    isActive && 'opacity-100',
                )}
            />
        </button>
    );
};

export default SidebarItem;
