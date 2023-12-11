import { getChapter } from '@/actions/get-chapter';
import { Banner } from '@/components/banner';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { VideoPlayer } from './_components/video-player';

const ChapterIdPage = async ({
    params,
}: {
    params: { courseId: string; chapterId: string };
}) => {
    const { userId } = auth();

    if (!userId) {
        return redirect('/');
    }

    // get chapter data
    const {
        chapter,
        course,
        muxData,
        nextChapter,
        attachments,
        userProgress,
        purchase,
    } = await getChapter({
        userId,
        chapterId: params.chapterId,
        courseId: params.courseId,
    });

    if (!chapter || !course) {
        return redirect('/');
    }

    const isLocked = !chapter.isFree && !purchase;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return (
        <div>
            {userProgress?.isCompleted && (
                <Banner
                    label="You already completed this chapter."
                    variant="success"
                />
            )}
            {isLocked && (
                <Banner
                    label="You need to purchase this course to watch this chapter."
                    variant="warning"
                />
            )}
            <div className="mx-auto flex max-w-4xl flex-col pb-20">
                <div className="p-4">
                    <VideoPlayer
                        chapterId={chapter.id}
                        title={chapter.title}
                        courseId={course.id}
                        nextChapterId={nextChapter?.id}
                        playbackId={muxData?.playbackId!}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>
            </div>
        </div>
    );
};
export default ChapterIdPage;
