import { UsersTable } from "../users-table";

const mockUsers = [
  { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "+90 532 123 4567", status: "active" as const },
  { id: "2", name: "Ayşe Demir", email: "ayse@example.com", phone: "+90 533 234 5678", status: "active" as const },
  { id: "3", name: "Mehmet Kaya", email: "mehmet@example.com", phone: "+90 534 345 6789", status: "inactive" as const },
  { id: "4", name: "Fatma Öz", email: "fatma@example.com", phone: "+90 535 456 7890", status: "active" as const },
];

export default function UsersTableExample() {
  return (
    <div className="p-6">
      <UsersTable
        users={mockUsers}
        onSendEmail={(ids) => console.log("Send email to:", ids)}
        onSendSMS={(ids) => console.log("Send SMS to:", ids)}
      />
    </div>
  );
}
