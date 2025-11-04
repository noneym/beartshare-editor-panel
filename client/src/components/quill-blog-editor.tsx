import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import ImageResize from 'quill-image-resize-module-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileCode, Type, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Register image resize module (only once, outside component)
Quill.register('modules/imageResize', ImageResize);

interface QuillBlogEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export function QuillBlogEditor({ initialContent, onChange }: QuillBlogEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.variants && data.variants.length > 0) {
        const imageUrl = data.variants[0];
        insertImage(imageUrl);
        setIsImageDialogOpen(false);
        toast({
          title: 'Başarılı',
          description: 'Resim Cloudflare Images\'a yüklendi.',
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Hata',
        description: 'Resim yüklenirken bir hata oluştu. Cloudflare API ayarlarını kontrol edin.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const insertImage = (url: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      quill.insertEmbed(range?.index || 0, 'image', url);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else {
        toast({
          title: 'Hata',
          description: 'Lütfen bir resim dosyası seçin.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleImageDialogSubmit = () => {
    if (imageUrl) {
      insertImage(imageUrl);
      setIsImageDialogOpen(false);
      setImageUrl('');
    }
  };

  const toggleHtmlMode = () => {
    if (!isHtmlMode) {
      // Switching to HTML mode - get current content from Quill
      const quill = quillRef.current?.getEditor();
      if (quill) {
        setHtmlContent(quill.root.innerHTML);
      }
    } else {
      // Switching back to visual mode - restore HTML content to Quill
      const quill = quillRef.current?.getEditor();
      if (quill) {
        // Use clipboard.dangerouslyPasteHTML to properly set HTML with inline styles
        quill.clipboard.dangerouslyPasteHTML(htmlContent);
        onChange(htmlContent); // Notify parent
      }
    }
    setIsHtmlMode(!isHtmlMode);
  };

  const handleHtmlChange = (html: string) => {
    setHtmlContent(html);
    onChange(html);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {}
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  // Set up image handler after Quill mounts
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const toolbar = quill.getModule('toolbar');
      toolbar.addHandler('image', () => {
        console.log('[QuillBlogEditor] Image handler called');
        // Use simple prompt for now (reliable cross-browser solution)
        const url = prompt('Resim URL\'sini girin:');
        if (url) {
          const range = quill.getSelection();
          quill.insertEmbed(range?.index || 0, 'image', url);
        }
      });
    }
  }, []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet',
    'indent',
    'align',
    'link', 'image', 'video'
  ];

  return (
    <>
      <div className="quill-editor-wrapper">
        <div className="flex items-center gap-2 p-2 bg-muted/30 border-b border-border">
          <Button
            variant={isHtmlMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleHtmlMode}
            data-testid="button-html-toggle"
            title={isHtmlMode ? 'Görsel Editör' : 'HTML Kaynak'}
          >
            {isHtmlMode ? <Type className="w-4 h-4 mr-2" /> : <FileCode className="w-4 h-4 mr-2" />}
            {isHtmlMode ? 'Görsel' : 'HTML'}
          </Button>
          {isHtmlMode && (
            <span className="text-xs text-muted-foreground">HTML kaynak kodunu düzenleyebilirsiniz</span>
          )}
        </div>
        
        {isHtmlMode ? (
          <Textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="min-h-[400px] font-mono text-sm border-0 rounded-none focus-visible:ring-0 resize-none"
            placeholder="HTML içeriğini buraya girin..."
            data-testid="textarea-html-source"
          />
        ) : (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={initialContent}
            onChange={onChange}
            modules={modules}
            formats={formats}
            placeholder="Blog içeriğinizi buraya yazın..."
            className="bg-background"
            data-testid="quill-editor"
          />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={isImageDialogOpen} onOpenChange={(open) => {
        console.log('[QuillBlogEditor] Dialog onOpenChange:', open);
        setIsImageDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resim Ekle (Cloudflare Images)</DialogTitle>
            <DialogDescription>
              Resim otomatik olarak Cloudflare Images'a yüklenecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Resim URL</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-url"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">veya</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              data-testid="button-upload-image"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Cloudflare\'e Yükleniyor...' : 'Bilgisayardan Yükle (Cloudflare)'}
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImageDialogOpen(false)}
              data-testid="button-cancel-image"
            >
              İptal
            </Button>
            <Button
              onClick={handleImageDialogSubmit}
              disabled={!imageUrl || isUploading}
              data-testid="button-insert-image"
            >
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
