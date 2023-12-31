import { isTeacher } from '@/lib/teacher';
import { auth } from '@clerk/nextjs';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

const handlesAuth = () => {
    const { userId } = auth(); // extract the userId
    const isAuthorized = isTeacher(userId); // check if the user is authorized

    if (!userId || !isAuthorized) throw new Error('Unauthorized');
    return { userId };
};
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Course image (Thumbnail)
    courseImage: f({
        image: { maxFileSize: '4MB', maxFileCount: 1 },
    })
        .middleware(() => handlesAuth()) // our permission is that user must be logged in
        .onUploadComplete(() => {}),

    // Course attachments (text, image, video, audio, pdf)
    courseAttachment: f(['text', 'image', 'video', 'audio', 'pdf'])
        .middleware(() => handlesAuth())
        .onUploadComplete(() => {}),

    // course Chapter video (video)
    courseChapterVideo: f({ video: { maxFileSize: '512GB', maxFileCount: 1 } })
        .middleware(() => handlesAuth())
        .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
