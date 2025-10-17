import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Clock, CheckCircle2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { QuotationsList } from "@/components/quotations/QuotationsList";
import { toast } from "sonner";

interface DashboardStats {
  totalQuotations: number;
  pendingQuotations: number;
  confirmedQuotations: number;
  totalPurchaseOrders: number;
  conversionRate: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotations: 0,
    pendingQuotations: 0,
    confirmedQuotations: 0,
    totalPurchaseOrders: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: quotations } = await supabase.from("quotations").select("*");
      const { data: purchaseOrders } = await supabase.from("purchase_orders").select("*");

      if (quotations && purchaseOrders) {
        const pending = quotations.filter((q) => q.status === "pending").length;
        const confirmed = quotations.filter((q) => q.status === "confirmed").length;
        const total = quotations.length;
        const conversion = total > 0 ? (confirmed / total) * 100 : 0;

        setStats({
          totalQuotations: total,
          pendingQuotations: pending,
          confirmedQuotations: confirmed,
          totalPurchaseOrders: purchaseOrders.length,
          conversionRate: Math.round(conversion),
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Quotations",
      value: stats.totalQuotations,
      icon: FileText,
      color: "primary",
    },
    {
      title: "Pending Quotations",
      value: stats.pendingQuotations,
      icon: Clock,
      color: "warning",
    },
    {
      title: "Confirmed",
      value: stats.confirmedQuotations,
      icon: CheckCircle2,
      color: "success",
    },
    {
      title: "Conversion Rate",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: "accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Quotation Tracker</h1>
            <p className="text-muted-foreground">Manage and track all your quotations in one place</p>
          </div>
          <Link to="/new-quotation">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Quotation
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    stat.color === "primary"
                      ? "bg-primary/10 text-primary"
                      : stat.color === "warning"
                      ? "bg-warning/10 text-warning"
                      : stat.color === "success"
                      ? "bg-success/10 text-success"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <QuotationsList onUpdate={fetchStats} />
      </div>
    </div>
  );
};

export default Dashboard;
