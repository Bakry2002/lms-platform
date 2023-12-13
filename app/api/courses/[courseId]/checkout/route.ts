import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(
    req: Request,
    { params }: { params: { courseId: string } },
) {
    try {
        const user = await currentUser();

        if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // fetch the course we try to purchase
        const course = await db.course.findUnique({
            where: { id: params.courseId, isPublished: true },
        });

        // check if we have already purchased the course
        const isPurchased = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    courseId: params.courseId,
                    userId: user.id,
                },
            },
        });

        if (isPurchased) {
            return new NextResponse('Already purchased', { status: 400 });
        }

        if (!course) {
            return new NextResponse('Course not found', { status: 404 });
        }

        // define line_item for stripe
        //A list of items the customer is purchasing. Use this parameter to pass one-time or recurring Prices.
        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                quantity: 1,
                price_data: {
                    currency: 'USD',
                    product_data: {
                        name: course.title,
                        description: course.description!,
                    },
                    unit_amount: Math.round(course.price! * 100), // stripe expects cents
                },
            },
        ];

        // create stripe customer
        let stripeCustomer = await db.stripeCustomer.findUnique({
            where: { userId: user.id },
            select: {
                stripeCustomerId: true,
            },
        });

        if (!stripeCustomer) {
            // if no stripe customer found, means this is the first time user purchase a course from us, so create a stripe customer
            const customer = await stripe.customers.create({
                email: user.emailAddresses?.[0]?.emailAddress,
            });

            // define the stripe customer is our db
            stripeCustomer = await db.stripeCustomer.create({
                data: {
                    userId: user.id,
                    stripeCustomerId: customer.id,
                },
            });
        }

        // create stripe checkout session to redirect user to stripe checkout page
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomer.stripeCustomerId,
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
            metadata: {
                courseId: course.id,
                userId: user.id,
            },
            // use this metadata in the webhook to update the purchase table in our db
        });

        return NextResponse.json({ url: session.url }); // redirect user to stripe checkout page
    } catch (error) {
        console.log('[ERROR] [POST] /api/courses/[courseId]/checkout', error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}
