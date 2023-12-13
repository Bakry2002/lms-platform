import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

//! in local development, you must run the stripe cli to forward the events to your local server
//! COMMAND: stripe listen --forward-to localhost:3000/api/webhook

export async function POST(req: Request) {
    const body = await req.text(); // get the raw body of the request
    const signature = headers().get('stripe-signature') as string; // get the signature sent by stripe

    let event: Stripe.Event;

    try {
        event = Stripe.webhooks.constructEvent(
            // verify that the EVENT is sent by stripe
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, {
            status: 400,
        });
    }

    // get the session
    const session = event.data.object as Stripe.Checkout.Session;

    // get the userId, courseId from the metadata
    const userId = session?.metadata?.userId;
    const courseId = session?.metadata?.courseId;

    if (event.type === 'checkout.session.completed') {
        // check if we have a userId and courseId
        if (!userId || !courseId) {
            return new NextResponse('Webhook Error: Missing data', {
                status: 400,
            });
        }
        // save the purchase in the database
        await db.purchase.create({
            data: {
                userId,
                courseId,
            },
        });
    } else {
        return new NextResponse(
            `Webhook Error: unhandled event type ${event.type}`,
            { status: 200 },
        );
    }

    return new NextResponse(null, { status: 200 });
}
