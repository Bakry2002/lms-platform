'use client';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CourseEnrollButtonProps {
    courseId: string;
    price: number;
}

export const CourseEnrollButton = ({
    courseId,
    price,
}: CourseEnrollButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            const response = await axios.post(
                `/api/courses/${courseId}/checkout`,
            );

            window.location.assign(response.data.url); // Redirect to checkout page
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(true);
        }
    };
    return (
        <Button
            className="w-full md:w-auto"
            size="sm"
            disabled={isLoading}
            onClick={onClick}
        >
            Enroll for {formatPrice(price)}
        </Button>
    );
};
