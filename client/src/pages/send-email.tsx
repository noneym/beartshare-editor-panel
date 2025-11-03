import { useState } from "react";
import { Search, FileCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "@/components/message-composer";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EmailTemplatePreview } from "@/components/email-template-preview";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, EmailTemplate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SendEmail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const { toast } = useToast();

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: { userIds: number[], subject?: string, message?: string, templateId?: number, customText?: string }) => {
      const res = await apiRequest("POST", "/api/send-email", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Başarılı",
        description: `${data.sentCount} kullanıcıya e-posta gönderildi.`,
      });
      setSelectedUsers(new Set());
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "E-posta gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const formattedUsers = users.map(user => ({
    id: user.id.toString(),
    name: `${user.name} ${user.lastname || ''}`.trim(),
    email: user.email,
  }));

  const filteredUsers = formattedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
  };

  const deselectAll = () => {
    setSelectedUsers(new Set());
  };

  const allSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUsers.has(u.id));

  const selectedRecipients = formattedUsers.filter((u) => selectedUsers.has(u.id));

  const formattedTemplates = templates.map(t => ({
    id: t.id.toString(),
    name: t.name,
    subject: t.subject,
    content: t.content,
  }));

  const currentTemplate = formattedTemplates.find(t => t.id === selectedTemplate);

  const handleSendEmail = (data: { subject?: string, message: string }) => {
    const userIds = Array.from(selectedUsers).map(id => parseInt(id));
    sendEmailMutation.mutate({
      userIds,
      subject: data.subject,
      message: data.message,
      templateId: selectedTemplate ? parseInt(selectedTemplate) : undefined,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">E-posta Gönder</h1>
        <p className="text-muted-foreground">Kullanıcılara toplu e-posta gönderin.</p>
      </div>

      <Card className="p-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="template-select" className="text-sm font-medium mb-2 block">
              E-posta Şablonu Seç (İsteğe Bağlı)
            </Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger id="template-select" className="h-11" data-testid="select-template">
                <SelectValue placeholder="Şablon seçin veya manuel oluşturun" />
              </SelectTrigger>
              <SelectContent>
                {formattedTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedTemplate && (
            <Button
              variant="outline"
              onClick={() => setShowTemplatePreview(true)}
              data-testid="button-preview-selected-template"
            >
              <FileCode className="w-4 h-4 mr-2" />
              Önizle
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Alıcıları Seçin</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={allSelected ? deselectAll : selectAll}
              data-testid="button-select-all"
            >
              {allSelected ? "Tümünü Kaldır" : "Tümünü Seç"}
            </Button>
          </div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
                data-testid="input-search-recipients"
              />
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover-elevate"
                data-testid={`recipient-${user.id}`}
              >
                <Checkbox
                  checked={selectedUsers.has(user.id)}
                  onCheckedChange={() => toggleUser(user.id)}
                  data-testid={`checkbox-recipient-${user.id}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <MessageComposer
            type="email"
            recipients={selectedRecipients}
            onSend={handleSendEmail}
            onRemoveRecipient={(id) => {
              const newSelected = new Set(selectedUsers);
              newSelected.delete(id);
              setSelectedUsers(newSelected);
            }}
            isLoading={sendEmailMutation.isPending}
          />
        </div>
      </div>

      {showTemplatePreview && currentTemplate && (
        <EmailTemplatePreview
          open={showTemplatePreview}
          onClose={() => setShowTemplatePreview(false)}
          template={currentTemplate}
        />
      )}
    </div>
  );
}
