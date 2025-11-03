import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UsersTable } from "@/components/users-table";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const formattedUsers = users.map(user => ({
    id: user.id.toString(),
    name: `${user.name} ${user.surname || ''}`.trim(),
    email: user.email,
    phone: user.phone || "",
    status: (user.status as "active" | "inactive") || "active",
  }));

  const filteredUsers = formattedUsers.filter(
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

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
      ) : (
        <UsersTable
          users={filteredUsers}
          onSendEmail={(ids) => console.log("Send email to:", ids)}
          onSendSMS={(ids) => console.log("Send SMS to:", ids)}
        />
      )}
    </div>
  );
}
