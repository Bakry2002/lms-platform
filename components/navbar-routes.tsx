'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { Loader2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SearchInput from './search-input';
import { isTeacher } from '@/lib/teacher';

const NavbarRoutes = () => {
    const { userId } = useAuth();
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsMounted(true);
        }, 1000);
    }, []);

    // check if we on teacher page
    const isTeacherPage = pathname?.startsWith('/teacher');
    // check if we in player page (individual course page)
    const isCourse = pathname?.includes('/courses');
    const isSearchPage = pathname === '/search'; // check if we on search page

    return (
        <>
            {isSearchPage && (
                <div className="hidden md:block">
                    <SearchInput />
                </div>
            )}
            <div className="ml-auto flex gap-x-2">
                {isTeacherPage || isCourse ? (
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <LogOut className="mr-2 h-4 w-4" />
                            Exit
                        </Button>
                    </Link>
                ) : isTeacher(userId) ? (
                    <Link href="/teacher/courses">
                        <Button variant="ghost" size="sm">
                            Teacher mode
                        </Button>
                    </Link>
                ) : null}

                {isMounted ? (
                    <UserButton afterSignOutUrl="/" />
                ) : (
                    <Loader2 className="tex h-8 w-8 animate-spin text-slate-700" />
                )}
            </div>
        </>
    );
};

export default NavbarRoutes;
