"use client";

import Image from "next/image";
import ImagePreviewModal from "./ImagePreviewModal";
import { useState } from "react";
import { Fullscreen } from "lucide-react";
import { DEFAULT_BLUR } from "@/lib/placeholderBlur";

type Props = {
    imgUrl: string,
    i: number
}

const Gallery = ({ imgUrl, i }: Props) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    return (
        <>
            <button
                onClick={() => setPreviewUrl(imgUrl)}
                className="relative aspect-square group overflow-hidden rounded-2xl border border-white/10 hover:border-cyan-strong/40 transition-colors shadow-lg cursor-pointer group"
            >
                <Image
                    src={imgUrl}
                    alt={`Galeri ${i + 1}`}
                    width={120}
                    height={120}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={DEFAULT_BLUR}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 absolute inset-0 bg-background/50 flex items-center justify-center">
                    <Fullscreen size={50} />
                </div>
            </button>

            {previewUrl && (
                <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
            )}
        </>
    )
}

export default Gallery;