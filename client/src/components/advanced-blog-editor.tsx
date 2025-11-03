import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link2,
  Image,
  Upload,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code,
  Quote,
  Palette,
  Undo,
  Redo,
  Type,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdvancedBlogEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

export function AdvancedBlogEditor({ initialContent = "", onChange }: AdvancedBlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(initialContent);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editorRef.current && initialContent && !content) {
      editorRef.current.innerHTML = initialContent;
      setContent(initialContent);
      setHtmlContent(initialContent);
    }
  }, [initialContent]);

  // Update visual editor when switching from HTML mode back to visual mode
  useEffect(() => {
    if (!isHtmlMode && editorRef.current && htmlContent) {
      editorRef.current.innerHTML = htmlContent;
    }
  }, [isHtmlMode, htmlContent]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      setHtmlContent(html);
      onChange?.(html);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      setHtmlContent(html);
      onChange?.(html);
    }
  };

  const handleHtmlChange = (html: string) => {
    setHtmlContent(html);
    setContent(html);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
    onChange?.(html);
  };

  const toggleHtmlMode = () => {
    if (!isHtmlMode) {
      // Switching to HTML mode
      if (editorRef.current) {
        setHtmlContent(editorRef.current.innerHTML);
      }
    } else {
      // Switching back to visual mode
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlContent;
        setContent(htmlContent);
        onChange?.(htmlContent);
      }
    }
    setIsHtmlMode(!isHtmlMode);
  };

  const insertHeading = (level: 1 | 2 | 3) => {
    execCommand("formatBlock", `<h${level}>`);
  };

  const insertLink = () => {
    const url = prompt("Link URL'sini girin:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const changeTextColor = () => {
    const color = prompt("Renk kodunu girin (örn: #FF0000):");
    if (color) {
      execCommand("foreColor", color);
    }
  };

  const changeBackgroundColor = () => {
    const color = prompt("Arka plan renk kodunu girin (örn: #FFFF00):");
    if (color) {
      execCommand("backColor", color);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.variants && data.variants.length > 0) {
        // Use the public variant URL
        const imageUrl = data.variants[0];
        insertImageUrl(imageUrl);
        setIsImageDialogOpen(false);
        toast({
          title: "Başarılı",
          description: "Resim yüklendi.",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Hata",
        description: "Resim yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const insertImageUrl = (url: string) => {
    if (url) {
      execCommand("insertImage", url);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      } else {
        toast({
          title: "Hata",
          description: "Lütfen bir resim dosyası seçin.",
          variant: "destructive",
        });
      }
    }
  };

  const openImageDialog = () => {
    setImageUrl("");
    setIsImageDialogOpen(true);
  };

  const handleImageDialogSubmit = () => {
    if (imageUrl) {
      insertImageUrl(imageUrl);
      setIsImageDialogOpen(false);
      setImageUrl("");
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/30">
          <div className="flex flex-wrap gap-1">
            {/* Mode Toggle */}
            <Button
              variant={isHtmlMode ? "default" : "outline"}
              size="sm"
              onClick={toggleHtmlMode}
              data-testid="button-html-mode-toggle"
              title={isHtmlMode ? "Görsel Editör" : "HTML Kodu"}
            >
              {isHtmlMode ? <Type className="w-4 h-4" /> : <FileCode className="w-4 h-4" />}
            </Button>

            <Separator orientation="vertical" className="mx-1 h-9" />

            {!isHtmlMode && (
              <>
                {/* History */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("undo")}
                  data-testid="button-undo"
                  title="Geri Al"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("redo")}
                  data-testid="button-redo"
                  title="Yinele"
                >
                  <Redo className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-9" />

                {/* Headings */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => insertHeading(1)}
                  data-testid="button-h1"
                  title="Başlık 1"
                >
                  <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => insertHeading(2)}
                  data-testid="button-h2"
                  title="Başlık 2"
                >
                  <Heading2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => insertHeading(3)}
                  data-testid="button-h3"
                  title="Başlık 3"
                >
                  <Heading3 className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-9" />

                {/* Text Formatting */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("bold")}
                  data-testid="button-bold"
                  title="Kalın"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("italic")}
                  data-testid="button-italic"
                  title="İtalik"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("underline")}
                  data-testid="button-underline"
                  title="Altı Çizili"
                >
                  <Underline className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("strikeThrough")}
                  data-testid="button-strikethrough"
                  title="Üstü Çizili"
                >
                  <Strikethrough className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-9" />

                {/* Alignment */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("justifyLeft")}
                  data-testid="button-align-left"
                  title="Sola Hizala"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("justifyCenter")}
                  data-testid="button-align-center"
                  title="Ortala"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("justifyRight")}
                  data-testid="button-align-right"
                  title="Sağa Hizala"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("justifyFull")}
                  data-testid="button-align-justify"
                  title="İki Yana Yasla"
                >
                  <AlignJustify className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-9" />

                {/* Lists */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("insertUnorderedList")}
                  data-testid="button-ul"
                  title="Madde Listesi"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("insertOrderedList")}
                  data-testid="button-ol"
                  title="Numaralı Liste"
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-9" />

                {/* Block Elements */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("formatBlock", "<blockquote>")}
                  data-testid="button-blockquote"
                  title="Alıntı"
                >
                  <Quote className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => execCommand("formatBlock", "<pre>")}
                  data-testid="button-code-block"
                  title="Kod Bloğu"
                >
                  <Code className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-9" />

                {/* Colors */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={changeTextColor}
                  data-testid="button-text-color"
                  title="Yazı Rengi"
                >
                  <Palette className="w-4 h-4" />
                </Button>

                <Separator orientation="vertical" className="mx-1 h-9" />

                {/* Media */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={insertLink}
                  data-testid="button-link"
                  title="Link Ekle"
                >
                  <Link2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={openImageDialog}
                  data-testid="button-image"
                  title="Resim Ekle"
                >
                  <Image className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {isHtmlMode ? (
          <Textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="min-h-96 font-mono text-sm border-0 rounded-none focus-visible:ring-0"
            placeholder="HTML içeriğini buraya girin..."
            data-testid="textarea-html-source"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="min-h-96 p-6 focus:outline-none prose prose-sm max-w-none"
            data-placeholder="Blog içeriğinizi buraya yazın..."
            data-testid="editor-content"
          />
        )}
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resim Ekle</DialogTitle>
            <DialogDescription>
              Bilgisayarınızdan bir resim yükleyin veya bir URL girin.
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
              {isUploading ? "Yükleniyor..." : "Bilgisayardan Yükle"}
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
