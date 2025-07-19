import { useState, useRef, useEffect } from 'react';
import { Circle, Square, MousePointer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Annotation {
  id: string;
  type: 'rectangle' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AnnotationCanvasProps {
  image: HTMLImageElement;
  onSelectionComplete: (selectedArea: ImageData, annotation: Annotation) => void;
}

export const AnnotationCanvas = ({ image, onSelectionComplete }: AnnotationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'rectangle' | 'circle'>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    if (canvasRef.current && image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to fit image while maintaining aspect ratio
      const maxWidth = 800;
      const maxHeight = 600;
      const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
      
      canvas.width = image.width * ratio;
      canvas.height = image.height * ratio;
      
      if (overlayRef.current) {
        overlayRef.current.width = canvas.width;
        overlayRef.current.height = canvas.height;
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
  }, [image]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setStartPos(pos);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !overlayRef.current) return;

    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getMousePos(e);
    
    // Clear overlay
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw existing annotations
    drawAnnotations(ctx);
    
    // Draw current selection
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const width = currentPos.x - startPos.x;
    const height = currentPos.y - startPos.y;
    
    if (tool === 'rectangle') {
      ctx.strokeRect(startPos.x, startPos.y, width, height);
    } else {
      const centerX = startPos.x + width / 2;
      const centerY = startPos.y + height / 2;
      const radius = Math.sqrt(width * width + height * height) / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const currentPos = getMousePos(e);
    
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);
    
    if (width < 10 || height < 10) return; // Ignore tiny selections
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      type: tool,
      x: Math.min(startPos.x, currentPos.x),
      y: Math.min(startPos.y, currentPos.y),
      width,
      height
    };
    
    setAnnotations(prev => [...prev, annotation]);
    
    // Extract selected area from main canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(annotation.x, annotation.y, annotation.width, annotation.height);
        onSelectionComplete(imageData, annotation);
      }
    }
  };

  const drawAnnotations = (ctx: CanvasRenderingContext2D) => {
    annotations.forEach(annotation => {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      if (annotation.type === 'rectangle') {
        ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
      } else {
        const centerX = annotation.x + annotation.width / 2;
        const centerY = annotation.y + annotation.height / 2;
        const radius = Math.sqrt(annotation.width * annotation.width + annotation.height * annotation.height) / 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    if (overlayRef.current) {
      const ctx = overlayRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
      }
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={tool === 'rectangle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('rectangle')}
          className="gap-2"
        >
          <Square className="w-4 h-4" />
          Rectangle
        </Button>
        
        <Button
          variant={tool === 'circle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('circle')}
          className="gap-2"
        >
          <Circle className="w-4 h-4" />
          Circle
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={clearAnnotations}
          className="gap-2 ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-lg border">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={() => setIsDrawing(false)}
        />
      </div>
      
      <p className="text-sm text-muted-foreground">
        Use the tools above to select areas of the screenshot. Selected areas will be highlighted in green.
      </p>
    </Card>
  );
};