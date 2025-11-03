import { Users, Mail, MessageSquare, FileText } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { User, BlogPost } from "@shared/schema";

export default function Dashboard() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: posts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  const activeUsers = users.filter(u => u.status === "active").length;
  const publishedPosts = posts.filter(p => p.status === "published").length;

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Hoş geldiniz! İşte sistemin genel görünümü.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={users.length.toString()}
          icon={Users}
          trend={`${activeUsers} aktif`}
          trendPositive={true}
        />
        <StatCard
          title="E-posta Şablonları"
          value="Hazır"
          icon={Mail}
          trend="Toplu gönderim"
          trendPositive={true}
        />
        <StatCard
          title="SMS Sistemi"
          value="Aktif"
          icon={MessageSquare}
          trend="NetGSM entegre"
          trendPositive={true}
        />
        <StatCard
          title="Blog Yazıları"
          value={posts.length.toString()}
          icon={FileText}
          trend={`${publishedPosts} yayında`}
          trendPositive={true}
        />
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-lg mb-4">Sistem Özeti</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-sm">Kullanıcı Yönetimi</p>
              <p className="text-xs text-muted-foreground">Kullanıcıları görüntüleyin ve yönetin</p>
            </div>
            <span className="text-xs text-muted-foreground">{users.length} kullanıcı</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-sm">E-posta Gönderimi</p>
              <p className="text-xs text-muted-foreground">Brevo SMTP ile toplu e-posta</p>
            </div>
            <span className="text-xs text-muted-foreground">Aktif</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="font-medium text-sm">SMS Gönderimi</p>
              <p className="text-xs text-muted-foreground">NetGSM SOAP API entegrasyonu</p>
            </div>
            <span className="text-xs text-muted-foreground">Aktif</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div>
              <p className="font-medium text-sm">Blog Yönetimi</p>
              <p className="text-xs text-muted-foreground">Blog yazıları ve kategoriler</p>
            </div>
            <span className="text-xs text-muted-foreground">{posts.length} yazı</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
