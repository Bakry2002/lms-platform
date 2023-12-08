'use client';

import * as z from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { File, ImageIcon, Loader2, Pencil, PlusCircle, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Attachment, Course } from '@prisma/client';
import Image from 'next/image';
import { FileUpload } from '@/components/file-upload';

interface AttachmentFormProps {
    initialData: Course & {
        attachment: Attachment[];
    };
    courseId: string;
}

const formSchema = z.object({
    url: z.string().min(1),
});
const AttachmentForm = ({ initialData, courseId }: AttachmentFormProps) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const toggleEditing = () => {
        setIsEditing((current) => !current);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/attachments`, values);
            toast.success('Course updated');
            toggleEditing();
            router.refresh();
        } catch {
            toast.error("Something wen wrong, couldn't update");
        }
    };

    const onDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
            toast.success('Attachment deleted');
            router.refresh();
        } catch {
            toast.error("Something wen wrong, couldn't delete");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mt-6 rounded-md border bg-slate-100 p-4">
            <div className="flex items-center justify-between font-medium">
                Course attachments
                <Button variant="ghost" onClick={toggleEditing}>
                    {isEditing && <>Cancel</>}

                    {!isEditing && (
                        <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add a file
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <>
                    {initialData.attachment.length === 0 && (
                        <p className="mt-2 text-sm italic text-muted-foreground">
                            No attachment yet
                        </p>
                    )}
                    {initialData.attachment.length > 0 && (
                        <div className="space-y-2">
                            {initialData.attachment.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex w-full items-center rounded-md border border-sky-200 bg-sky-100 p-3 text-sky-700"
                                >
                                    <File className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <p className="line-clamp-1 text-xs">
                                        {attachment.name}
                                    </p>
                                    {deletingId === attachment.id ? (
                                        <div className="ml-auto">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                onDelete(attachment.id)
                                            }
                                            className="ml-auto transition hover:opacity-75"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseAttachment"
                        onChange={(url) => {
                            console.log('URL', url);
                            if (url) {
                                onSubmit({ url: url }); // submit the form with the new url
                            }
                        }}
                    />
                    <div className=" mt-4 text-sm text-muted-foreground">
                        Add anything your students might need to complete the
                        course
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachmentForm;
