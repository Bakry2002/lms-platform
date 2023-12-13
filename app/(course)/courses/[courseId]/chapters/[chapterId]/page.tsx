import { getChapter } from '@/actions/get-chapter';
import { Banner } from '@/components/banner';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { VideoPlayer } from './_components/video-player';
import { CourseEnrollButton } from './_components/course-enroll-button';
import { Separator } from '@/components/ui/separator';
import { Preview } from '@/components/preview';
import { File } from 'lucide-react';

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
                {/* Purchase UI */}
                <div>
                    <div className="flex flex-col items-center justify-between p-4 md:flex-row">
                        <h2 className="mb-2 text-2xl font-semibold">
                            {chapter.title}
                        </h2>
                        {purchase ? (
                            <div>// TODO: add chapter progress</div>
                        ) : (
                            <CourseEnrollButton
                                courseId={params.courseId}
                                price={course.price!}
                            />
                        )}
                    </div>
                    <Separator />
                    <div>
                        <Preview value={chapter.description!} />
                    </div>
                    {!!attachments?.length && (
                        <>
                            <Separator />
                            <div className="p-4">
                                {attachments.map((attachment) => (
                                    <a
                                        href={attachment.url}
                                        target="_blank"
                                        className="flex w-full items-center rounded-md border bg-sky-200 p-3 text-sky-700 hover:underline"
                                        key={attachment.id}
                                    >
                                        <File />
                                        <p className="line-clamp-1">
                                            {attachment.name}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ChapterIdPage;
