import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddPointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  userPhone: string;
}

export function AddPointDialog({ open, onOpenChange, userId, userName, userPhone }: AddPointDialogProps) {
  const { toast } = useToast();
  const [points, setPoints] = useState("");
  const [note, setNote] = useState("");
  const [sendSms, setSendSms] = useState(false);
  const [smsMessage, setSmsMessage] = useState(
    `Merhaba ${userName}, hesabınıza [PUAN] puan eklendi. Mevcut puanınız: [TOPLAM] puan. Teşekkürler!`
  );

  const addPointMutation = useMutation({
    mutationFn: async (data: { points: number; note: string; sendSms: boolean; smsMessage: string }) => {
      const res = await apiRequest("POST", `/api/users/${userId}/points`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId.toString(), "points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId.toString(), "points-summary"] });
      toast({
        title: "Başarılı",
        description: sendSms ? "Puan eklendi ve SMS gönderildi." : "Puan eklendi.",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Puan eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPoints("");
    setNote("");
    setSendSms(false);
    setSmsMessage(`Merhaba ${userName}, hesabınıza [PUAN] puan eklendi. Mevcut puanınız: [TOPLAM] puan. Teşekkürler!`);
  };

  const handleSubmit = () => {
    const pointsNum = parseInt(points);
    
    if (!points || isNaN(pointsNum) || pointsNum <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir puan miktarı girin.",
        variant: "destructive",
      });
      return;
    }

    if (sendSms && !userPhone) {
      toast({
        title: "Hata",
        description: "Kullanıcının telefon numarası bulunamadı. SMS gönderilemez.",
        variant: "destructive",
      });
      return;
    }

    if (sendSms && !smsMessage.trim()) {
      toast({
        title: "Hata",
        description: "SMS mesajı boş olamaz.",
        variant: "destructive",
      });
      return;
    }

    addPointMutation.mutate({
      points: pointsNum,
      note: note.trim(),
      sendSms,
      smsMessage: smsMessage.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-add-point">
        <DialogHeader>
          <DialogTitle>Puan Ekle</DialogTitle>
          <DialogDescription>
            {userName} kullanıcısına puan ekleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="points">Puan Miktarı *</Label>
            <Input
              id="points"
              type="number"
              placeholder="Örn: 100"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              min="1"
              data-testid="input-points"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Not (İsteğe Bağlı)</Label>
            <Textarea
              id="note"
              placeholder="Puan ekleme nedeni..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              data-testid="textarea-note"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="send-sms"
              checked={sendSms}
              onCheckedChange={(checked) => setSendSms(checked as boolean)}
              data-testid="checkbox-send-sms"
            />
            <Label htmlFor="send-sms" className="cursor-pointer">
              SMS ile müşteriye bilgi ver
            </Label>
          </div>

          {sendSms && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="sms-message">SMS Mesajı</Label>
              <Textarea
                id="sms-message"
                placeholder="SMS mesajını düzenleyin..."
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                data-testid="textarea-sms-message"
              />
              <p className="text-xs text-muted-foreground">
                Not: [PUAN] ve [TOPLAM] etiketleri otomatik olarak değiştirilecektir.
              </p>
              {!userPhone && (
                <p className="text-xs text-destructive">
                  Uyarı: Kullanıcının telefon numarası yok, SMS gönderilemez.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            data-testid="button-cancel"
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addPointMutation.isPending}
            data-testid="button-submit"
          >
            {addPointMutation.isPending ? "Ekleniyor..." : "Puan Ekle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
