import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailTemplateCard } from "@/components/email-template-card";
import { EmailTemplatePreview } from "@/components/email-template-preview";
import { useLocation } from "wouter";

export default function EmailTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [, setLocation] = useLocation();

  const mockTemplates = [
    {
      id: "1",
      name: "Hoş Geldiniz E-postası",
      subject: "Merhaba [isim], Beartshare'e Hoş Geldiniz!",
      content: "<h2>Merhaba [isim] [soyisim]!</h2><p>Beartshare ailesine katıldığınız için teşekkür ederiz. E-posta adresiniz: [email]</p><p>[metin]</p>",
      tags: ["[isim]", "[soyisim]", "[email]", "[metin]"],
    },
    {
      id: "2",
      name: "Şifre Sıfırlama",
      subject: "[isim], şifrenizi sıfırlayın",
      content: "<h2>Merhaba [isim]!</h2><p>Şifre sıfırlama talebiniz alındı. [email] adresinize gönderilen bağlantıyı kullanarak şifrenizi sıfırlayabilirsiniz.</p><p>[metin]</p>",
      tags: ["[isim]", "[email]", "[metin]"],
    },
    {
      id: "3",
      name: "Kampanya Duyurusu",
      subject: "Özel Kampanya - [metin]",
      content: "<h2>Sayın [isim] [soyisim],</h2><p>Sizin için özel bir kampanyamız var! [metin]</p><p>Detaylar için [email] adresinden bize ulaşabilirsiniz.</p>",
      tags: ["[isim]", "[soyisim]", "[email]", "[metin]"],
    },
  ];

  const filteredTemplates = mockTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (id: string) => {
    const template = mockTemplates.find(t => t.id === id);
    if (template) {
      setPreviewTemplate(template);
    }
  };

  const handleUse = (id: string) => {
    console.log("Use template:", id);
    setLocation(`/send-email?template=${id}`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-2">E-posta Şablonları</h1>
          <p className="text-muted-foreground">E-posta şablonlarınızı oluşturun ve yönetin.</p>
        </div>
        <Button onClick={() => setLocation("/email-templates/new")} data-testid="button-new-template">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Şablon
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Şablon ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-templates"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <EmailTemplateCard
            key={template.id}
            {...template}
            preview={template.content.substring(0, 150)}
            onEdit={(id) => setLocation(`/email-templates/edit/${id}`)}
            onDelete={(id) => console.log("Delete template:", id)}
            onPreview={handlePreview}
            onUse={handleUse}
          />
        ))}
      </div>

      {previewTemplate && (
        <EmailTemplatePreview
          open={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          template={previewTemplate}
        />
      )}
    </div>
  );
}
