import { db } from '@/lib/db';
import { Attachment, Chapter } from '@prisma/client';

interface GetChapterAction {
    userId: string;
    courseId: string;
    chapterId: string;
}

export const getChapter = async ({
    userId,
    courseId,
    chapterId,
}: GetChapterAction) => {
    try {
        // first check: is the user purchased the course?
        const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });

        // get the course
        const course = await db.course.findUnique({
            where: {
                id: courseId,
                isPublished: true,
            },
        });

        // get the chapter
        const chapter = await db.chapter.findUnique({
            where: {
                id: chapterId,
                isPublished: true,
            },
        });

        if (!chapter || !course) {
            throw new Error('Chapter or course not found');
        }

        // initialize the muxData & attachments
        let muxData = null;
        let attachments: Attachment[] = [];

        // next chapter
        let nextChapter: Chapter | null = null;

        // we will get this above if the user purchased the course
        if (purchase) {
            // load attachments
            attachments = await db.attachment.findMany({
                where: {
                    courseId,
                },
            });
        }

        if (chapter.isFree || purchase) {
            // get the mux data (video) if the chapter is free or the user purchased the course
            muxData = await db.muxData.findUnique({
                where: {
                    chapterId,
                },
            });

            nextChapter = await db.chapter.findFirst({
                where: {
                    courseId,
                    isPublished: true,
                    position: {
                        gt: chapter?.position, // the position of the current chapter is less than the next chapter
                    },
                },
                orderBy: {
                    position: 'asc',
                },
            });
        }

        // get user progress for this chapter
        const userProgress = await db.userProgress.findUnique({
            where: {
                userId_chapterId: {
                    userId,
                    chapterId,
                },
            },
        });

        // return the data
        return {
            chapter,
            course,
            muxData,
            attachments,
            nextChapter,
            userProgress,
            purchase,
        };
    } catch (error) {
        console.log('[ERROR] getChapter: ', error);
        return {
            chapter: null,
            course: null,
            muxData: null,
            attachments: [],
            nextChapter: null,
            userProgress: null,
            purchase: null,
        };
    }
};
