import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalUsers: number;
  totalRevenue: number;
  totalBookings: number;
  activeFields: number;
}

interface DailyRevenue {
  date: string;
  total: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRevenue: 0,
    totalBookings: 0,
    activeFields: 0,
  });
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact" });

      // Fetch total revenue and bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("total_amount")
        .eq("status", "paid");

      // Fetch active fields
      const { count: fieldCount } = await supabase
        .from("fields")
        .select("*", { count: "exact" })
        .eq("is_active", true);

      // Fetch daily revenue for the last 7 days
      const dates = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return format(date, "yyyy-MM-dd");
      }).reverse();

      const dailyData = await Promise.all(
        dates.map(async (date) => {
          const { data } = await supabase
            .from("bookings")
            .select("total_amount")
            .eq("booking_date", date)
            .eq("status", "paid");

          const total = data?.reduce((sum, item) => sum + item.total_amount, 0) || 0;

          return {
            date,
            total,
          };
        })
      );

      setStats({
        totalUsers: userCount || 0,
        totalRevenue: bookings?.reduce((sum, item) => sum + item.total_amount, 0) || 0,
        totalBookings: bookings?.length || 0,
        activeFields: fieldCount || 0,
      });

      setDailyRevenue(dailyData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: dailyRevenue.map((item) =>
      format(new Date(item.date), "dd MMM", { locale: id })
    ),
    datasets: [
      {
        label: "Pendapatan Harian",
        data: dailyRevenue.map((item) => item.total),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Pendapatan 7 Hari Terakhir",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `Rp ${value.toLocaleString()}`,
        },
      },
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Admin</h2>
        <p className="text-muted-foreground">
          Overview statistik dan performa bisnis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {stats.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lapangan Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeFields}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Pendapatan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line options={chartOptions} data={chartData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}