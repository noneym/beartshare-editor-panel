import { StatCard } from "../stat-card";
import { Users, Mail, MessageSquare, FileText } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
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
  );
}
