import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { MessageComposer } from "@/components/message-composer";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SendSMS() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Read query params on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const usersParam = urlParams.get('users');
    
    if (usersParam) {
      const userIds = usersParam.split(',');
      setSelectedUsers(new Set(userIds));
    }
  }, []);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const sendSMSMutation = useMutation({
    mutationFn: async (data: { userIds: number[], message: string }) => {
      const res = await apiRequest("POST", "/api/send-sms", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Başarılı",
        description: `${data.sentCount} kullanıcıya SMS gönderildi.`,
      });
      setSelectedUsers(new Set());
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "SMS gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const formattedUsers = users
    .filter(u => u.mobile)
    .map(user => ({
      id: user.id.toString(),
      name: `${user.name} ${user.lastname || ''}`.trim(),
      phone: user.mobile!,
    }));

  const filteredUsers = formattedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
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

  const handleSendSMS = (data: { message: string }) => {
    const userIds = Array.from(selectedUsers).map(id => parseInt(id));
    sendSMSMutation.mutate({
      userIds,
      message: data.message,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">SMS Gönder</h1>
        <p className="text-muted-foreground">Kullanıcılara toplu SMS gönderin.</p>
      </div>

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
                  <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <MessageComposer
            type="sms"
            recipients={selectedRecipients}
            onSend={handleSendSMS}
            onRemoveRecipient={(id) => {
              const newSelected = new Set(selectedUsers);
              newSelected.delete(id);
              setSelectedUsers(newSelected);
            }}
            isLoading={sendSMSMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
