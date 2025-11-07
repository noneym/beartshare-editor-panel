import { useState } from "react";
import { MoreVertical, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FormattedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
}

interface UsersTableProps {
  users: FormattedUser[];
  onSendEmail?: (userIds: string[]) => void;
  onSendSMS?: (userIds: string[]) => void;
  onViewUser?: (userId: string) => void;
}

export function UsersTable({ users, onSendEmail, onSendSMS, onViewUser }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      {selectedUsers.size > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-accent flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedUsers.size} kullanıcı seçildi
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => onSendEmail?.(Array.from(selectedUsers))}
              data-testid="button-send-email-selected"
            >
              <Mail className="w-4 h-4 mr-2" />
              E-posta Gönder
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => onSendSMS?.(Array.from(selectedUsers))}
              data-testid="button-send-sms-selected"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Gönder
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onCheckedChange={toggleAll}
                  data-testid="checkbox-select-all"
                />
              </TableHead>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id} 
                data-testid={`row-user-${user.id}`}
                className="cursor-pointer hover-elevate"
                onClick={() => onViewUser?.(user.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedUsers.has(user.id)}
                    onCheckedChange={() => toggleUser(user.id)}
                    data-testid={`checkbox-user-${user.id}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium" data-testid={`text-username-${user.id}`}>{user.name}</span>
                  </div>
                </TableCell>
                <TableCell data-testid={`text-email-${user.id}`}>{user.email}</TableCell>
                <TableCell data-testid={`text-phone-${user.id}`}>{user.phone}</TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    data-testid={`status-${user.id}`}
                  >
                    {user.status === "active" ? "Aktif" : "Pasif"}
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8" data-testid={`button-actions-${user.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSendEmail?.([user.id])}>
                        <Mail className="w-4 h-4 mr-2" />
                        E-posta Gönder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSendSMS?.([user.id])}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        SMS Gönder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
