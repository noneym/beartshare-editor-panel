import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UsersTable } from "@/components/users-table";

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockUsers = [
    { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "+90 532 123 4567", status: "active" as const },
    { id: "2", name: "Ayşe Demir", email: "ayse@example.com", phone: "+90 533 234 5678", status: "active" as const },
    { id: "3", name: "Mehmet Kaya", email: "mehmet@example.com", phone: "+90 534 345 6789", status: "inactive" as const },
    { id: "4", name: "Fatma Öz", email: "fatma@example.com", phone: "+90 535 456 7890", status: "active" as const },
    { id: "5", name: "Ali Şahin", email: "ali@example.com", phone: "+90 536 567 8901", status: "active" as const },
    { id: "6", name: "Zeynep Arslan", email: "zeynep@example.com", phone: "+90 537 678 9012", status: "active" as const },
  ];

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Kullanıcılar</h1>
        <p className="text-muted-foreground">Tüm kullanıcıları görüntüleyin ve yönetin.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-users"
          />
        </div>
      </div>

      <UsersTable
        users={filteredUsers}
        onSendEmail={(ids) => console.log("Send email to:", ids)}
        onSendSMS={(ids) => console.log("Send SMS to:", ids)}
      />
    </div>
  );
}
