import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, AlertCircle } from "lucide-react";

interface ImagePreviewModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImagePreviewModal({ imageUrl, isOpen, onClose }: ImagePreviewModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(true);
    }
  }, [isOpen, imageUrl]);

  if (!isOpen) return null;

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError("Failed to load image. The image may be corrupted or unavailable.");
  };

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `character-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Failed to download the image. Please try again.");
    }
  };

  const isBase64 = imageUrl?.startsWith('image');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-[90%] max-h-[90vh] bg-dark-card rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handleDownload}
            className="bg-dark-card/80 hover:bg-dark-card"
            disabled={!!error || isLoading}
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={onClose}
            className="bg-dark-card/80 hover:bg-dark-card"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-auto max-h-[90vh] flex items-center justify-center">
          {isLoading && !error && (
            <div className="p-8 text-center">Loading image...</div>
          )}
          {error && (
            <div className="p-8 text-center text-red-500 flex flex-col items-center">
              <AlertCircle className="h-10 w-10 mb-2" />
              <p>{error}</p>
            </div>
          )}
          <img
            src={isBase64 ? imageUrl : imageUrl}
            alt="Full-size preview"
            className={`w-full h-auto object-contain ${(error || isLoading) ? 'hidden' : 'block'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </div>
    </div>
  );
}