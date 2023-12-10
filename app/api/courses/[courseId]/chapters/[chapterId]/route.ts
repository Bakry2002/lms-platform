import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';

// initiate mux
const { Video } = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!,
);

// DELETE => to delete a chapter
export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string; chapterId: string } },
) {
    try {
        const { userId } = auth();
        const { courseId, chapterId } = params;

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

        // find the chapter to be deleted
        const chapter = await db.chapter.findUnique({
            where: {
                id: chapterId,
                courseId,
            },
        });

        if (!chapter) {
            return new NextResponse('Not found', {
                status: 404,
            });
        }

        // if chapter has a video, delete the asset from mux
        if (chapter.videoUrl) {
            // get mux data for this chapter
            const muxData = await db.muxData.findFirst({
                where: {
                    chapterId,
                },
            });

            if (muxData) {
                await Video.Assets.del(muxData.assetId);
                await db.muxData.delete({
                    where: {
                        id: muxData.id,
                    },
                });
            }
        }

        const deletedChapter = await db.chapter.delete({
            where: {
                id: chapterId,
            },
        });

        // check if the course still has any chapters, if not, set isPublished to false, why? because we don't want to show a course with no chapters
        const publishedChaptersInCourse = await db.chapter.findMany({
            where: {
                courseId,
                isPublished: true,
            },
        });

        if (!publishedChaptersInCourse.length) {
            await db.course.update({
                where: {
                    id: courseId,
                },
                data: {
                    isPublished: false,
                },
            });
        }

        return NextResponse.json(deletedChapter);
    } catch (error) {
        console.log(
            '[ERROR: DELETE] courses/[courseId]/chapters/[chapterId]/route.ts',
            error,
        );
        return new NextResponse('Internal server error', {
            status: 500,
        });
    }
}

// PATCH => to update a chapter
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
            '[ERROR: PATCH] courses/[courseId]/chapters/[chapterId]/route.ts',
            error,
        );
        return new NextResponse('Internal server error', {
            status: 500,
        });
    }
}
