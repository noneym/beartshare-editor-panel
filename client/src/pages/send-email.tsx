import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageComposer } from "@/components/message-composer";
import { Card } from "@/components/ui/card";

export default function SendEmail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const mockUsers = [
    { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com" },
    { id: "2", name: "Ayşe Demir", email: "ayse@example.com" },
    { id: "3", name: "Mehmet Kaya", email: "mehmet@example.com" },
    { id: "4", name: "Fatma Öz", email: "fatma@example.com" },
    { id: "5", name: "Ali Şahin", email: "ali@example.com" },
  ];

  const filteredUsers = mockUsers.filter(
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

  const selectedRecipients = mockUsers.filter((u) => selectedUsers.has(u.id));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">E-posta Gönder</h1>
        <p className="text-muted-foreground">Kullanıcılara toplu e-posta gönderin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-bold mb-4">Alıcıları Seçin</h3>
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
            onSend={(data) => console.log("Send email:", data)}
            onRemoveRecipient={(id) => {
              const newSelected = new Set(selectedUsers);
              newSelected.delete(id);
              setSelectedUsers(newSelected);
            }}
          />
        </div>
      </div>
    </div>
  );
}
