import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

// initiate mux
const { Video } = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!,
);

export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string; chapterId: string } },
) {
    try {
        const { courseId, chapterId } = params;

        // get userId from session
        const { userId } = auth();
        // get all values from request body
        const { isPublished, ...values } = await req.json();

        if (!userId) {
            return new NextResponse('Unauthorized', {
                status: 401,
            });
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                userId,
            },
        });

        if (!courseOwner) {
            return new NextResponse('Unauthorized', {
                status: 401,
            });
        }

        const chapter = await db.chapter.update({
            where: {
                id: chapterId,
                courseId,
            },
            data: {
                ...values,
            },
        });

        if (values.videoUrl) {
            // find existing mux data for this chapter, delete the asset if it already exists and create a new one
            const existingMuxData = await db.muxData.findFirst({
                where: {
                    chapterId,
                },
            });

            if (existingMuxData) {
                await Video.Assets.del(existingMuxData.assetId);
                await db.muxData.delete({
                    where: {
                        id: existingMuxData.id,
                    },
                });
            }

            // if no existing mux data, create a new one
            const asset = await Video.Assets.create({
                input: values.videoUrl,
                playback_policy: 'public',
                test: false,
            });

            await db.muxData.create({
                data: {
                    chapterId,
                    assetId: asset.id,
                    playbackId: asset.playback_ids?.[0]?.id,
                },
            });
        }

        return NextResponse.json(chapter);
    } catch (error) {
        console.log(
            '[ERROR] courses/[courseId]/chapters/[chapterId]/route.ts',
            error,
        );
        return new NextResponse('Internal server error', {
            status: 500,
        });
    }
}
