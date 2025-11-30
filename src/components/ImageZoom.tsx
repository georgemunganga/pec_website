import { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { X, ZoomIn } from 'lucide-react';
import { Button } from './ui/button';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative group cursor-zoom-in" onClick={() => setIsOpen(true)}>
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 rounded-full p-2">
            <ZoomIn className="w-6 h-6 text-foreground" />
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="relative w-full h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="overflow-auto max-h-[95vh] p-4">
              <img
                src={src}
                alt={alt}
                className="w-full h-auto"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
