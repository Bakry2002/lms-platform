'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Fragment, useState } from 'react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TitleFormProps {
    initialData: {
        title: string;
    };
    courseId: string;
}

const formSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
});
const TitleForm: React.FC<TitleFormProps> = ({ initialData, courseId }) => {
    const router = useRouter();
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const toggleEditTitle = () => {
        setIsEditingTitle((current) => !current);
    };
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData,
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success('Course updated');
            toggleEditTitle();
            router.refresh();
        } catch {
            toast.error("Something wen wrong, couldn't update course");
        }
    };

    return (
        <div className="mt-6 rounded-md border bg-slate-100 p-4">
            <div className="flex items-center justify-between font-medium">
                Course title
                <Button variant="ghost" onClick={toggleEditTitle}>
                    {isEditingTitle ? (
                        <Fragment>Cancel</Fragment>
                    ) : (
                        <Fragment>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit title
                        </Fragment>
                    )}
                </Button>
            </div>
            {!isEditingTitle && (
                <p className="mt-2 text-sm">{initialData.title}</p>
            )}
            {isEditingTitle && (
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
                                            placeholder="e.g. 'Advance web development'"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-x-2">
                            <Button
                                disabled={!isValid || isSubmitting}
                                type="submit"
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    );
};

export default TitleForm;
