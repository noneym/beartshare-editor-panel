import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/users-table";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import * as XLSX from "xlsx";

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const formattedUsers = users.map(user => ({
    id: user.id.toString(),
    name: `${user.name} ${user.lastname || ''}`.trim(),
    email: user.email,
    phone: user.mobile || "",
    status: (user.admin === 1 ? "active" : "active") as "active" | "inactive",
  }));

  const filteredUsers = formattedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
  );

  const handleExportExcel = () => {
    const exportData = users.map((user) => ({
      "ID": user.id,
      "Kullanıcı Adı": user.username || "",
      "Ad": user.name,
      "Soyad": user.lastname || "",
      "E-posta": user.email,
      "Telefon": user.mobile || "",
      "TC No": user.tcno || "",
      "Doğum Tarihi": user.birth_date || "",
      "Ref Code": user.ref_code || "",
      "Level": user.level || 0,
      "Admin": user.admin === 1 ? "Evet" : "Hayır",
      "Mail Doğrulama": user.mail_verify === 1 ? "Doğrulandı" : "Bekliyor",
      "Kayıt Tarihi": user.created_at || "",
      "Güncellenme": user.updated_at || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kullanıcılar");

    const fileName = `kullanicilar-${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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
        <Button
          onClick={handleExportExcel}
          variant="outline"
          data-testid="button-export-excel"
        >
          <Download className="w-4 h-4 mr-2" />
          Excel'e Aktar
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
      ) : (
        <UsersTable
          users={filteredUsers}
          onSendEmail={(ids) => setLocation(`/send-email?users=${ids.join(',')}`)}
          onSendSMS={(ids) => setLocation(`/send-sms?users=${ids.join(',')}`)}
          onViewUser={(id) => setLocation(`/users/${id}`)}
        />
      )}
    </div>
  );
}
