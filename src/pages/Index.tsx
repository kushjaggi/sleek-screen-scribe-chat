import { useState } from 'react';
import { ScreenshotUploader } from '@/components/ScreenshotUploader';
import { AnnotationCanvas } from '@/components/AnnotationCanvas';
import { ChatInterface } from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { MessageCircle, Camera, Zap } from 'lucide-react';

interface Annotation {
  id: string;
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
}

const Index = () => {
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [selectedArea, setSelectedArea] = useState<ImageData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleImageLoad = (image: HTMLImageElement) => {
    setCurrentImage(image);
    setSelectedArea(null);
    setIsChatOpen(false);
  };

  const handleSelectionComplete = (imageData: ImageData, annotation: Annotation) => {
    setSelectedArea(imageData);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">ScreenScribe AI</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Zap className="w-4 h-4" />
                Connect Azure AI
              </Button>
              
              {selectedArea && (
                <Button 
                  onClick={() => setIsChatOpen(true)}
                  className="gap-2"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Open Chat
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {!currentImage ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Screenshot Analysis Extension</h2>
              <p className="text-lg text-muted-foreground">
                Upload a screenshot, select any area, and chat with AI about what you see
              </p>
            </div>
            
            <ScreenshotUploader onImageLoad={handleImageLoad} />
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-card border space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-medium text-foreground">Upload Screenshot</h3>
                <p className="text-sm text-muted-foreground">Upload or drag & drop your screenshot</p>
              </div>
              
              <div className="p-4 rounded-lg bg-card border space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-medium text-foreground">Select Area</h3>
                <p className="text-sm text-muted-foreground">Draw rectangles or circles around areas of interest</p>
              </div>
              
              <div className="p-4 rounded-lg bg-card border space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-medium text-foreground">Chat with AI</h3>
                <p className="text-sm text-muted-foreground">Ask questions about the selected area</p>
              </div>
            </div>
          </div>
        ) : (
          <AnnotationCanvas 
            image={currentImage} 
            onSelectionComplete={handleSelectionComplete}
          />
        )}
      </main>

      {/* Chat Interface */}
      <ChatInterface 
        selectedArea={selectedArea}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default Index;
