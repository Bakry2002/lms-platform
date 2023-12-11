'use client';

import { cn } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import { Loader2, Lock } from 'lucide-react';
import { useState } from 'react';

interface CourseCardProps {
    playbackId: string;
    courseId: string;
    chapterId: string;
    nextChapterId?: string;
    isLocked: boolean;
    completeOnEnd: boolean;
    title: string;
}

export const VideoPlayer = ({
    playbackId,
    completeOnEnd,
    chapterId,
    nextChapterId,
    title,
    isLocked,
    courseId,
}: CourseCardProps) => {
    const [isReady, setIsReady] = useState(false);
    return (
        <div className="relative aspect-video">
            {!isReady && !isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            )}
            {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-slate-800 text-secondary">
                    <Lock className="h-8 w-8" />
                    <p className="text-sm">This chapter is locked</p>
                </div>
            )}
            {!isLocked && (
                <MuxPlayer
                    title={title}
                    className={cn(!isReady && 'hidden')}
                    onCanPlay={() => setIsReady(true)}
                    onEnded={() => {}}
                    playbackId={playbackId}
                    autoPlay
                />
            )}
        </div>
    );
};
