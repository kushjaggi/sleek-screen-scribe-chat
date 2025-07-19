import { useState, useRef } from 'react';
import { Upload, Camera, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ScreenshotUploaderProps {
  onImageLoad: (image: HTMLImageElement) => void;
}

export const ScreenshotUploader = ({ onImageLoad }: ScreenshotUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.onload = () => onImageLoad(img);
      img.src = URL.createObjectURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <Card className={`p-8 border-2 border-dashed transition-all duration-300 ${
      isDragOver ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50'
    }`}>
      <div
        className="text-center space-y-4"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Camera className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Upload Screenshot</h3>
          <p className="text-muted-foreground">
            Drag and drop a screenshot here, or click to browse
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Choose File
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Image className="w-4 h-4" />
            Paste Image
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </Card>
  );
};