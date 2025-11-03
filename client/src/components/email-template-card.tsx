import { Eye, Edit, Trash2, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmailTemplateCardProps {
  id: string;
  name: string;
  subject: string;
  preview: string;
  tags: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPreview?: (id: string) => void;
  onUse?: (id: string) => void;
}

export function EmailTemplateCard({
  id,
  name,
  subject,
  preview,
  tags,
  onEdit,
  onDelete,
  onPreview,
  onUse,
}: EmailTemplateCardProps) {
  return (
    <Card className="p-6 hover-elevate" data-testid={`card-template-${id}`}>
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-base mb-1" data-testid={`text-name-${id}`}>
            {name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3" data-testid={`text-subject-${id}`}>
            Konu: {subject}
          </p>
          <div className="text-sm text-muted-foreground line-clamp-3 bg-secondary/50 p-3 rounded-md border border-border">
            <div dangerouslySetInnerHTML={{ __html: preview }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            variant="default"
            onClick={() => onUse?.(id)}
            data-testid={`button-use-${id}`}
          >
            <Copy className="w-4 h-4 mr-2" />
            Kullan
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPreview?.(id)}
            data-testid={`button-preview-${id}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Önizle
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
