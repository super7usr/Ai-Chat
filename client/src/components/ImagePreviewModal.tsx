
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface ImagePreviewModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImagePreviewModal({ imageUrl, isOpen, onClose }: ImagePreviewModalProps) {
  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `character-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="relative max-w-4xl w-[90%] max-h-[90vh] bg-dark-card rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button size="icon" variant="outline" onClick={handleDownload} className="bg-dark-card/80 hover:bg-dark-card">
            <Download className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="outline" onClick={onClose} className="bg-dark-card/80 hover:bg-dark-card">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-auto max-h-[90vh]">
          <img 
            src={imageUrl} 
            alt="Full-size preview" 
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
}
