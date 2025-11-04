import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface BlogPostPreviewProps {
  open: boolean;
  onClose: () => void;
  post: {
    title: string;
    content: string;
    category?: string;
    date?: string;
  };
}

export function BlogPostPreview({ open, onClose, post }: BlogPostPreviewProps) {
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="modal-blog-preview">
        <DialogHeader>
          <DialogTitle>{post.title}</DialogTitle>
          {(post.category || post.date) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              {post.category && <span>{post.category}</span>}
              {post.date && <span>{post.date}</span>}
            </div>
          )}
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
            data-testid="blog-preview-content"
          />
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} data-testid="button-close-preview">
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
