'use client';

import * as z from 'zod';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ImageIcon, Pencil, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Course } from '@prisma/client';
import Image from 'next/image';
import { FileUpload } from '@/components/file-upload';

interface ImageFormProps {
    initialData: Course;
    courseId: string;
}

const formSchema = z.object({
    imageUrl: z.string().min(1, { message: 'Image is required' }),
});
const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEditing = () => {
        setIsEditing((current) => !current);
    };

    console.log('URL:', initialData?.imageUrl);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success('Course updated');
            toggleEditing();
            router.refresh();
        } catch {
            toast.error("Something wen wrong, couldn't update");
        }
    };

    return (
        <div className="mt-6 rounded-md border bg-slate-100 p-4">
            <div className="flex items-center justify-between font-medium">
                Course Image
                <Button variant="ghost" onClick={toggleEditing}>
                    {isEditing && <>Cancel</>}

                    {!isEditing && !initialData.imageUrl && (
                        <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add an image
                        </>
                    )}

                    {!isEditing && initialData.imageUrl && (
                        <>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit image
                        </>
                    )}
                </Button>
            </div>
            {!isEditing &&
                (!initialData.imageUrl ? (
                    <div className="flex h-60 items-center justify-center rounded-md bg-slate-200">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="relative mt-2 aspect-video">
                        <Image
                            src={initialData.imageUrl}
                            alt="Upload"
                            fill
                            className="rounded-md object-cover"
                        />
                    </div>
                ))}
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseImage"
                        onChange={(url) => {
                            console.log('URL', url);
                            if (url) {
                                onSubmit({ imageUrl: url }); // submit the form with the new url
                            }
                        }}
                    />
                    <div className=" mt-4 text-sm text-muted-foreground">
                        16:9 aspect ratio recommended
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageForm;
