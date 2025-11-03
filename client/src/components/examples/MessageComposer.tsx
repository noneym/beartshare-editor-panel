import { MessageComposer } from "../message-composer";

const mockRecipients = [
  { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com" },
  { id: "2", name: "Ayşe Demir", email: "ayse@example.com" },
];

export default function MessageComposerExample() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="font-bold mb-3">E-posta Composer</h3>
        <MessageComposer
          type="email"
          recipients={mockRecipients}
          onSend={(data) => console.log("Email sent:", data)}
          onRemoveRecipient={(id) => console.log("Remove recipient:", id)}
        />
      </div>
      <div>
        <h3 className="font-bold mb-3">SMS Composer</h3>
        <MessageComposer
          type="sms"
          recipients={mockRecipients}
          onSend={(data) => console.log("SMS sent:", data)}
          onRemoveRecipient={(id) => console.log("Remove recipient:", id)}
        />
      </div>
    </div>
  );
}
