'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

// create form schema
const formSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
});
const CreateCoursePage = () => {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema), // use zod to validate form
        defaultValues: {
            title: '',
        },
    });

    // destruct state from form
    const { isValid, isLoading, isSubmitting } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // send request to create course
            const response = await axios.post('/api/course', values);
            router.push(`/teacher/courses/${response.data.id}`);
        } catch {
            console.log("Something wen wrong, couldn't create course");
        }
    };

    return (
        <div className="mx-auto flex h-full max-w-5xl p-6 md:items-center md:justify-center">
            <div>
                <h1 className="text-2xl">Name your course</h1>
                <p className="text-sm text-muted-foreground">
                    What would you like to name your course? Don&apos;t worry,
                    you can change this later.
                </p>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="mt-8 space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course title</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={isSubmitting}
                                            {...field}
                                            placeholder="e.g. 'Advanced web development'"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        What will you teach in this course?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Link href="/">
                                <Button variant="ghost" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                            >
                                Continue
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default CreateCoursePage;
