'use client';

import { CldUploadWidget } from "next-cloudinary"; 
import Image from "next/image";
import { useCallback, useState } from "react";
import { TbPhotoPlus } from "react-icons/tb";

declare global {
    var cloudinary: any;
}

interface ImageUpladProps {
    onChange: (value: string[]) => void;
    value: string[];
}

const ImageUpload: React.FC<ImageUpladProps> = ({
    onChange,
    value,
}) => {
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);

    const handleUpload = useCallback((result: any) => {
        const newImageUrl = result.info.secure_url;
        setUploadedImages((prev) => [...prev, newImageUrl]);
    }, []);

    const handleClose = useCallback(() => {
        const updatedImageUrls = [...value, ...uploadedImages];
        onChange(updatedImageUrls);
        setUploadedImages([]);
    }, [onChange, uploadedImages, value]);

    return (
        <CldUploadWidget 
            onSuccess={handleUpload}
            onClose={handleClose}
            uploadPreset="hellophoto"
            options={{
                maxFiles: 10
            }}
        >
            {({ open }) => {
                return (
                    <div
                        onClick={() => open?.()}
                        className="
                            relative
                            cursor-pointer
                            hover:opacity-70
                            transition
                            border-dashed
                            border-2
                            p-20
                            border-neutral-300
                            flex
                            flex-col
                            justify-center
                            items-center
                            gap-4
                            text-neutral-600
                        "
                    >
                        <TbPhotoPlus  size={50} />
                        <div className="font-semibold text-lg">
                            Click to upload
                        </div>
                    </div>
                )
            }}
        </CldUploadWidget>
    )
}

export default ImageUpload;