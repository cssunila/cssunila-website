import { X } from "lucide-react";
import Image from "next/image";

const ImagePreviewModal = ({ url, onClose }: { url: string; onClose: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 rounded-full bg-slate-900 border border-white/10 p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shadow-xl"
        >
          <X size={16} />
        </button>
        <div className="relative w-full max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-slate-950">
          <Image
            src={url}
            alt="Preview"
            width={1920}
            height={1080}
            loading="lazy"
            placeholder="blur"
            className="w-full h-full object-contain max-h-[85vh]"
          />
        </div>
      </div>
    </div>
  );
}

export default ImagePreviewModal;
