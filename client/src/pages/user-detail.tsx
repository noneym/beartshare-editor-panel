import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Point, RefPointCashOut } from "@shared/schema";
import { AddPointDialog } from "@/components/add-point-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isAddPointOpen, setIsAddPointOpen] = useState(false);
  const userId = parseInt(id!);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", id],
  });

  const { data: pointsSummary } = useQuery<{ earned: number; spent: number; total: number }>({
    queryKey: ["/api/users", id, "points-summary"],
  });

  const { data: points = [] } = useQuery<Point[]>({
    queryKey: ["/api/users", id, "points"],
  });

  const { data: cashOuts = [] } = useQuery<RefPointCashOut[]>({
    queryKey: ["/api/users", id, "cash-outs"],
  });

  if (!user) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/users")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">
            {user.name} {user.lastname}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button onClick={() => setIsAddPointOpen(true)} data-testid="button-add-point">
          <Plus className="w-4 h-4 mr-2" />
          Puan Ekle
        </Button>
      </div>

      {/* Points Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kazanılan Puan</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsSummary?.earned || 0}</div>
            <p className="text-xs text-muted-foreground">Toplam kazanılan puan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Harcanan Puan</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsSummary?.spent || 0}</div>
            <p className="text-xs text-muted-foreground">Toplam harcanan puan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mevcut Bakiye</CardTitle>
            <Wallet className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pointsSummary?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Kullanılabilir puan</p>
          </CardContent>
        </Card>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Telefon</p>
            <p className="font-medium">{user.mobile || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">TC No</p>
            <p className="font-medium">{user.tcno || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Doğum Tarihi</p>
            <p className="font-medium">{user.birth_date || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ref Code</p>
            <p className="font-medium">{user.ref_code || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="font-medium">{user.level || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
            <p className="font-medium">{user.created_at || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Puan Geçmişi</CardTitle>
          <CardDescription>Kullanıcının kazandığı puanlar</CardDescription>
        </CardHeader>
        <CardContent>
          {points.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Henüz puan kaydı yok
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Puan</TableHead>
                  <TableHead>Not</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {points.map((point) => (
                  <TableRow key={point.id}>
                    <TableCell>{point.created_at || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        +{point.points}
                      </Badge>
                    </TableCell>
                    <TableCell>{point.note || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={point.status === "1" ? "default" : "secondary"}>
                        {point.status === "1" ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cash Outs History */}
      {cashOuts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Harcama Geçmişi</CardTitle>
            <CardDescription>Kullanıcının harcadığı puanlar</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Puan</TableHead>
                  <TableHead>Durum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashOuts.map((cashOut) => (
                  <TableRow key={cashOut.id}>
                    <TableCell>{cashOut.created_at || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        -{cashOut.points}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cashOut.status === "1" ? "default" : "secondary"}>
                        {cashOut.status === "1" ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AddPointDialog
        open={isAddPointOpen}
        onOpenChange={setIsAddPointOpen}
        userId={userId}
        userName={`${user.name} ${user.lastname || ''}`.trim()}
        userPhone={user.mobile || ''}
      />
    </div>
  );
}
