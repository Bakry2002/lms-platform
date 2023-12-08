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
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Course } from '@prisma/client';
import { formatPrice } from '@/lib/format';

interface PriceFormProps {
    initialData: Course;
    courseId: string;
}

const formSchema = z.object({
    price: z.coerce.number(), // coerce string to number
});
const PriceForm: React.FC<PriceFormProps> = ({ initialData, courseId }) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const toggleEditing = () => {
        setIsEditing((current) => !current);
    };
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            price: initialData?.price || undefined,
        },
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success('Course updated');
            toggleEditing();
            router.refresh();
        } catch {
            toast.error("Something wen wrong, couldn't update course");
        }
    };

    return (
        <div className="mt-6 rounded-md border bg-slate-100 p-4">
            <div className="flex items-center justify-between font-medium">
                Course price
                <Button variant="ghost" onClick={toggleEditing}>
                    {isEditing ? (
                        <Fragment>Cancel</Fragment>
                    ) : (
                        <Fragment>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit price
                        </Fragment>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <p
                    className={cn(
                        'mt-2 text-sm',
                        !initialData.price && 'italic text-muted-foreground',
                    )}
                >
                    {initialData.price
                        ? formatPrice(initialData.price)
                        : 'No price'}
                </p>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="mt-4 space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            step="0.01"
                                            placeholder="Set a price for your course"
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

export default PriceForm;
