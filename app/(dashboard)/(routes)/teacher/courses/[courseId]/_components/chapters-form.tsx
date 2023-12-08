'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle } from 'lucide-react';
import { Fragment, useState } from 'react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Course } from '@prisma/client';
import { Input } from '@/components/ui/input';

interface ChaptersFormProps {
    initialData: Course;
    courseId: string;
}

const formSchema = z.object({
    title: z.string().min(1),
});
const ChaptersForm: React.FC<ChaptersFormProps> = ({
    initialData,
    courseId,
}) => {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false); // for creating chapters
    const [isUpdating, setIsUpdating] = useState(false); // for updating specific chapter

    const toggleCreating = () => {
        setIsCreating((current) => !current);
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post(`/api/courses/${courseId}/chapters`, values);
            toast.success('Course updated');
            toggleCreating();
            router.refresh();
        } catch {
            toast.error("Something wen wrong, couldn't update course");
        }
    };

    return (
        <div className="mt-6 rounded-md border bg-slate-100 p-4">
            <div className="flex items-center justify-between font-medium">
                Course Chapters
                <Button variant="ghost" onClick={toggleCreating} className="">
                    {isCreating ? (
                        <Fragment>Cancel</Fragment>
                    ) : (
                        <Fragment>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add a chapter
                        </Fragment>
                    )}
                </Button>
            </div>
            {isCreating && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="mt-4 space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            placeholder="e.g. 'Introduction'"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            disabled={!isValid || isSubmitting}
                            type="submit"
                        >
                            Create
                        </Button>
                    </form>
                </Form>
            )}
            {!isCreating && <div>No chapters</div>}
            {!isCreating && (
                <p className="mt-4 text-xs text-muted-foreground">
                    Drag and drop to reorder the chapters
                </p>
            )}
        </div>
    );
};

export default ChaptersForm;
