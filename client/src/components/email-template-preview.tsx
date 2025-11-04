import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface EmailTemplatePreviewProps {
  open: boolean;
  onClose: () => void;
  template: {
    name: string;
    subject: string;
    content: string;
  };
}

export function EmailTemplatePreview({ open, onClose, template }: EmailTemplatePreviewProps) {
  const [previewData, setPreviewData] = useState({
    isim: "Ahmet",
    soyisim: "Yılmaz",
    email: "ahmet@example.com",
    metin: "Örnek metin içeriği",
  });

  const replaceVariables = (text: string) => {
    return text
      .replace(/\[isim\]/g, previewData.isim)
      .replace(/\[soyisim\]/g, previewData.soyisim)
      .replace(/\[email\]/g, previewData.email)
      .replace(/\[metin\]/g, previewData.metin);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Şablon Önizleme: {template.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4 bg-muted/30">
            <h3 className="font-bold text-sm mb-3">Test Verileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preview-isim" className="text-xs">İsim</Label>
                <Input
                  id="preview-isim"
                  value={previewData.isim}
                  onChange={(e) => setPreviewData({ ...previewData, isim: e.target.value })}
                  className="h-9 mt-1"
                  data-testid="input-preview-isim"
                />
              </div>
              <div>
                <Label htmlFor="preview-soyisim" className="text-xs">Soyisim</Label>
                <Input
                  id="preview-soyisim"
                  value={previewData.soyisim}
                  onChange={(e) => setPreviewData({ ...previewData, soyisim: e.target.value })}
                  className="h-9 mt-1"
                  data-testid="input-preview-soyisim"
                />
              </div>
              <div>
                <Label htmlFor="preview-email" className="text-xs">E-posta</Label>
                <Input
                  id="preview-email"
                  value={previewData.email}
                  onChange={(e) => setPreviewData({ ...previewData, email: e.target.value })}
                  className="h-9 mt-1"
                  data-testid="input-preview-email"
                />
              </div>
              <div>
                <Label htmlFor="preview-metin" className="text-xs">Metin</Label>
                <Input
                  id="preview-metin"
                  value={previewData.metin}
                  onChange={(e) => setPreviewData({ ...previewData, metin: e.target.value })}
                  className="h-9 mt-1"
                  data-testid="input-preview-metin"
                />
              </div>
            </div>
          </Card>

          <div>
            <h3 className="font-bold text-sm mb-2">Konu</h3>
            <Card className="p-4">
              <p className="text-sm" data-testid="preview-subject">{replaceVariables(template.subject)}</p>
            </Card>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2">İçerik</h3>
            <Card className="p-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: replaceVariables(template.content) }}
                data-testid="preview-content"
              />
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} data-testid="button-close-preview">
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
