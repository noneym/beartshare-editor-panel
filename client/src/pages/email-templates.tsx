import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailTemplateCard } from "@/components/email-template-card";
import { EmailTemplatePreview } from "@/components/email-template-preview";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EmailTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function EmailTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/email-templates/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({
        title: "Başarılı",
        description: "Şablon silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Şablon silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const formattedTemplates = templates.map(t => ({
    id: t.id.toString(),
    name: t.name,
    subject: t.subject,
    content: t.content,
    tags: ["[isim]", "[soyisim]", "[email]", "[metin]"],
  }));

  const filteredTemplates = formattedTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreview = (id: string) => {
    const template = formattedTemplates.find(t => t.id === id);
    if (template) {
      setPreviewTemplate(template);
    }
  };

  const handleUse = (id: string) => {
    setLocation(`/send-email?template=${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu şablonu silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(parseInt(id));
    }
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

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <EmailTemplateCard
              key={template.id}
              {...template}
              preview={template.content.substring(0, 150)}
              onEdit={(id) => setLocation(`/email-templates/edit/${id}`)}
              onDelete={handleDelete}
              onPreview={handlePreview}
              onUse={handleUse}
            />
          ))}
        </div>
      )}

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
