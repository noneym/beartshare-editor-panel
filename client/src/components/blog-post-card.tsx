import { Calendar, Edit, Trash2, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogPostCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  status: "published" | "draft";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

export function BlogPostCard({
  id,
  title,
  excerpt,
  category,
  date,
  status,
  onEdit,
  onDelete,
  onView,
}: BlogPostCardProps) {
  return (
    <Card className="p-6 hover-elevate" data-testid={`card-blog-post-${id}`}>
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-base line-clamp-2" data-testid={`text-title-${id}`}>
              {title}
            </h3>
            <Badge
              variant={status === "published" ? "default" : "secondary"}
              className="shrink-0"
              data-testid={`badge-status-${id}`}
            >
              {status === "published" ? "Yayında" : "Taslak"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`text-excerpt-${id}`}>
            {excerpt}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span data-testid={`text-date-${id}`}>{date}</span>
          </div>
          <Badge variant="outline" className="text-xs" data-testid={`badge-category-${id}`}>
            {category}
          </Badge>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView?.(id)}
            data-testid={`button-view-${id}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Görüntüle
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit?.(id)}
            data-testid={`button-edit-${id}`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Düzenle
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete?.(id)}
            data-testid={`button-delete-${id}`}
            className="ml-auto text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Sil
          </Button>
        </div>
      </div>
    </Card>
  );
}
