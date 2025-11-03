import { useState, useRef, useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Link2, Image, Heading1, Heading2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BlogEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
}

export function BlogEditor({ initialContent = "", onChange }: BlogEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (editorRef.current && initialContent && !content) {
      editorRef.current.innerHTML = initialContent;
      setContent(initialContent);
    }
  }, [initialContent]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      onChange?.(html);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      onChange?.(html);
    }
  };

  const insertHeading = (level: 1 | 2) => {
    execCommand("formatBlock", `<h${level}>`);
  };

  const insertLink = () => {
    const url = prompt("Link URL'sini girin:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Resim URL'sini girin:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex flex-wrap gap-1">
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
          
          <Separator orientation="vertical" className="mx-1 h-9" />
          
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
          
          <Separator orientation="vertical" className="mx-1 h-9" />
          
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
            onClick={insertImage}
            data-testid="button-image"
            title="Resim Ekle"
          >
            <Image className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-96 p-6 focus:outline-none prose prose-sm max-w-none"
        data-placeholder="Blog içeriğinizi buraya yazın..."
        data-testid="editor-content"
      />
    </Card>
  );
}
