'use client';

import * as z from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle, Video } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Chapter, MuxData } from '@prisma/client';
import Image from 'next/image';
import { FileUpload } from '@/components/file-upload';

interface ChapterVideoFormProps {
    initialData: Chapter & {
        muxData?: MuxData | null;
    };
    courseId: string;
    chapterId: string;
}

const formSchema = z.object({
    videoUrl: z.string().min(1),
});

const ChapterVideoForm = ({
    initialData,
    courseId,
    chapterId,
}: ChapterVideoFormProps) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEditing = () => {
        setIsEditing((current) => !current);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(
                `/api/courses/${courseId}/chapters/${chapterId}`,
                values,
            );
            toast.success('Chapter updated');
            toggleEditing();
            router.refresh();
        } catch {
            toast.error("Something wen wrong, couldn't update");
        }
    };

    return (
        <div className="mt-6 rounded-md border bg-slate-100 p-4">
            <div className="flex items-center justify-between font-medium">
                Chapter video
                <Button variant="ghost" onClick={toggleEditing}>
                    {isEditing && <>Cancel</>}

                    {!isEditing && !initialData.videoUrl && (
                        <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add an video
                        </>
                    )}

                    {!isEditing && initialData.videoUrl && (
                        <>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit video
                        </>
                    )}
                </Button>
            </div>
            {!isEditing &&
                (!initialData.videoUrl ? (
                    <div className="flex h-60 items-center justify-center rounded-md bg-slate-200">
                        <Video className="h-10 w-10 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="relative mt-2 aspect-video">
                        Video uploaded!
                    </div>
                ))}
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseChapterVideo"
                        onChange={(url) => {
                            if (url) {
                                onSubmit({ videoUrl: url }); // submit the form with the new url
                            }
                        }}
                    />
                    <div className=" mt-4 text-sm text-muted-foreground">
                        Upload this chapter&apos;s video.
                    </div>
                </div>
            )}

            {initialData.videoUrl && !isEditing && (
                <div className="mt-2 text-xs text-muted-foreground">
                    Videos csn take a few minutes to process. Refresh the page
                    if video does not appear.
                </div>
            )}
        </div>
    );
};

export default ChapterVideoForm;
