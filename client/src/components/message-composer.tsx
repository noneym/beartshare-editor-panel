import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdvancedBlogEditor } from "./advanced-blog-editor";

interface MessageComposerProps {
  type: "email" | "sms";
  recipients: Array<{ id: string; name: string; email?: string; phone?: string }>;
  onSend?: (data: { subject?: string; message: string }) => void;
  onRemoveRecipient?: (id: string) => void;
  isLoading?: boolean;
  initialSubject?: string;
  initialMessage?: string;
  onSubjectChange?: (subject: string) => void;
  onMessageChange?: (message: string) => void;
}

export function MessageComposer({ 
  type, 
  recipients, 
  onSend, 
  onRemoveRecipient, 
  isLoading,
  initialSubject = "",
  initialMessage = "",
  onSubjectChange,
  onMessageChange,
}: MessageComposerProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);

  // Sync when props change (template selection)
  useEffect(() => {
    if (initialSubject !== subject) {
      setSubject(initialSubject);
    }
  }, [initialSubject]);

  useEffect(() => {
    if (initialMessage !== message) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  // Sync with parent state
  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    onSubjectChange?.(newSubject);
  };

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
    onMessageChange?.(newMessage);
  };

  const handleSend = () => {
    const data = type === "email" ? { subject, message } : { message };
    onSend?.(data);
    console.log(`Sending ${type}:`, data);
  };

  const maxLength = type === "sms" ? 160 : undefined;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Alıcılar ({recipients.length})
          </Label>
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50 min-h-[60px]">
            {recipients.map((recipient) => (
              <Badge
                key={recipient.id}
                variant="secondary"
                className="px-3 py-1.5 gap-2"
                data-testid={`badge-recipient-${recipient.id}`}
              >
                <span>{recipient.name}</span>
                {onRemoveRecipient && (
                  <button
                    onClick={() => onRemoveRecipient(recipient.id)}
                    className="hover-elevate rounded-full"
                    data-testid={`button-remove-recipient-${recipient.id}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
            {recipients.length === 0 && (
              <span className="text-sm text-muted-foreground">Alıcı seçilmedi</span>
            )}
          </div>
        </div>

        {type === "email" && (
          <div>
            <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
              Konu
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              placeholder="E-posta konusu"
              className="h-11"
              data-testid="input-subject"
            />
          </div>
        )}

        <div>
          <Label className="text-sm font-medium mb-2 block">
            Mesaj
          </Label>
          {type === "email" ? (
            <AdvancedBlogEditor
              initialContent={message}
              onChange={handleMessageChange}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                {maxLength && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {message.length}/{maxLength}
                  </span>
                )}
              </div>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="SMS mesajınızı yazın..."
                className="min-h-48 resize-none"
                maxLength={maxLength}
                data-testid="input-message"
              />
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSend}
            disabled={!message || recipients.length === 0 || isLoading}
            data-testid="button-send"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? "Gönderiliyor..." : type === "email" ? "E-posta Gönder" : "SMS Gönder"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
