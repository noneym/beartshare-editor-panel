import { Users, Mail, MessageSquare, FileText } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";

export default function Dashboard() {
  const recentActivity = [
    { id: 1, action: "E-posta gönderildi", target: "25 kullanıcıya", time: "5 dakika önce" },
    { id: 2, action: "Yeni blog yazısı", target: "React Temelleri", time: "2 saat önce" },
    { id: 3, action: "SMS gönderildi", target: "50 kullanıcıya", time: "3 saat önce" },
    { id: 4, action: "Kullanıcı kaydı", target: "Ahmet Yılmaz", time: "5 saat önce" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Hoş geldiniz! İşte sistemin genel görünümü.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value="1,234"
          icon={Users}
          trend="+12% bu ay"
          trendPositive={true}
        />
        <StatCard
          title="Gönderilen E-posta"
          value="8,567"
          icon={Mail}
          trend="+24% bu ay"
          trendPositive={true}
        />
        <StatCard
          title="Gönderilen SMS"
          value="4,321"
          icon={MessageSquare}
          trend="-3% bu ay"
          trendPositive={false}
        />
        <StatCard
          title="Blog Yazıları"
          value="87"
          icon={FileText}
          trend="+5 yeni"
          trendPositive={true}
        />
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-lg mb-4">Son Aktiviteler</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
              data-testid={`activity-${activity.id}`}
            >
              <div>
                <p className="font-medium text-sm">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.target}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
