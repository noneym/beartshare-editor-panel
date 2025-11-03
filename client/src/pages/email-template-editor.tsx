import { useState } from "react";
import { Save, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlogEditor } from "@/components/blog-editor";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmailTemplatePreview } from "@/components/email-template-preview";
import { useLocation } from "wouter";

export default function EmailTemplateEditor() {
  const [, setLocation] = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: "",
    subject: "",
    content: "",
  });

  const handleSave = () => {
    console.log("Save template:", templateData);
    setLocation("/email-templates");
  };

  const availableTags = [
    { tag: "[isim]", description: "Alıcının adı" },
    { tag: "[soyisim]", description: "Alıcının soyadı" },
    { tag: "[email]", description: "Alıcının e-posta adresi" },
    { tag: "[metin]", description: "Özel metin alanı" },
  ];

  const insertTag = (tag: string) => {
    // Basit bir clipboard kopyalama
    navigator.clipboard.writeText(tag);
    console.log("Tag copied:", tag);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/email-templates")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-2">Yeni E-posta Şablonu</h1>
            <p className="text-muted-foreground">Yeniden kullanılabilir e-posta şablonu oluşturun.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)} data-testid="button-preview-template">
            <Eye className="w-4 h-4 mr-2" />
            Önizle
          </Button>
          <Button onClick={handleSave} data-testid="button-save-template">
            <Save className="w-4 h-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="template-name" className="text-sm font-medium mb-2 block">
              Şablon Adı
            </Label>
            <Input
              id="template-name"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              placeholder="Örn: Hoş Geldiniz E-postası"
              className="h-11"
              data-testid="input-template-name"
            />
          </div>

          <div>
            <Label htmlFor="template-subject" className="text-sm font-medium mb-2 block">
              E-posta Konusu
            </Label>
            <Input
              id="template-subject"
              value={templateData.subject}
              onChange={(e) => setTemplateData({ ...templateData, subject: e.target.value })}
              placeholder="Örn: Merhaba [isim], Beartshare'e Hoş Geldiniz!"
              className="h-11"
              data-testid="input-template-subject"
            />
          </div>

          <div>
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Kullanılabilir Etiketler</Label>
              <Card className="p-4 bg-muted/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableTags.map((item) => (
                    <div key={item.tag} className="space-y-1">
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover-elevate w-full justify-center"
                        onClick={() => insertTag(item.tag)}
                        data-testid={`badge-tag-${item.tag.replace(/[\[\]]/g, '')}`}
                      >
                        {item.tag}
                      </Badge>
                      <p className="text-xs text-muted-foreground text-center">{item.description}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Etikete tıklayarak kopyalayın ve editöre yapıştırın
                </p>
              </Card>
            </div>

            <Label className="text-sm font-medium mb-2 block">Şablon İçeriği</Label>
            <BlogEditor
              initialContent={templateData.content}
              onChange={(content) => setTemplateData({ ...templateData, content })}
            />
          </div>
        </div>
      </Card>

      {showPreview && (
        <EmailTemplatePreview
          open={showPreview}
          onClose={() => setShowPreview(false)}
          template={templateData}
        />
      )}
    </div>
  );
}
