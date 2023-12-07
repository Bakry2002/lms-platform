'use client';

import { UploadDropzone } from '@/lib/uploadthing';
import { ourFileRouter } from '@/app/api/uploadthing/core';
import toast from 'react-hot-toast';

interface FileUploadProps {
    onChange: (url?: string) => void;
    endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
    console.log('endpoint:', endpoint);
    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                console.log('URL from fil-upload.tsx:', res?.[0].url);
                onChange(res?.[0].url);
            }}
            onUploadError={(err: Error) => {
                toast.error(`[file-upload.tsx]: ${err?.message}`);
            }}
        />
    );
};
