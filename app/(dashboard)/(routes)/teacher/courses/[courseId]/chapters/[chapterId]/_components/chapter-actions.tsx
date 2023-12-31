'use client';

import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Loader2, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ChapterActionsProps {
    courseId: string;
    chapterId: string;
    isPublished: boolean;
    disabled: boolean;
}
export const ChapterActions = ({
    courseId,
    chapterId,
    isPublished,
    disabled,
}: ChapterActionsProps) => {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const onClick = async () => {
        try {
            setIsPublishing(true);

            if (isPublished) {
                await axios.patch(
                    `/api/courses/${courseId}/chapters/${chapterId}/unpublish`,
                ); // unpublish the chapter if it is published
                toast.success('Chapter unpublished');
            } else {
                await axios.patch(
                    `/api/courses/${courseId}/chapters/${chapterId}/publish`,
                ); // publish the chapter
                toast.success('Chapter published');
            }
            router.refresh();
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsPublishing(false);
        }
    };

    const onDelete = async () => {
        try {
            setIsDeleting(true);
            await axios.delete(
                `/api/courses/${courseId}/chapters/${chapterId}`,
            );
            toast.success('Chapter deleted');
            router.refresh();
            router.push(`/teacher/courses/${courseId}`);
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-x-2">
            <Button
                onClick={onClick}
                disabled={disabled || isPublishing}
                variant="outline"
                size="sm"
            >
                {isPublishing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPublished ? (
                    'Unpublish'
                ) : (
                    'Publish'
                )}
            </Button>
            <ConfirmModal onConfirm={onDelete}>
                <Button size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash className="h-4 w-4" />
                    )}
                </Button>
            </ConfirmModal>
        </div>
    );
};
