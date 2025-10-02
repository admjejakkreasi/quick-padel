import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface BookingSummary {
  total_bookings: number;
  pending_bookings: number;
  today_bookings: number;
  total_amount: number;
}

interface RecentBooking {
  id: string;
  booking_date: string;
  start_time: string;
  customer_name: string;
  field: {
    name: string;
  };
  status: string;
  total_amount: number;
}

export default function KasirDashboard() {
  const [summary, setSummary] = useState<BookingSummary>({
    total_bookings: 0,
    pending_bookings: 0,
    today_bookings: 0,
    total_amount: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      
      // Get summary
      const { data: summaryData } = await supabase
        .from("bookings")
        .select("status", { count: "exact" });

      const { data: pendingCount } = await supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .eq("status", "pending");

      const { data: todayCount } = await supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .eq("booking_date", today);

      const { data: totalAmount } = await supabase
        .from("bookings")
        .select("total_amount")
        .eq("status", "paid");

      // Get recent bookings
      const { data: recentData } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          start_time,
          customer_name,
          status,
          total_amount,
          field:field_id (name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      setSummary({
        total_bookings: summaryData?.length || 0,
        pending_bookings: pendingCount?.length || 0,
        today_bookings: todayCount?.length || 0,
        total_amount: totalAmount?.reduce((sum, item) => sum + item.total_amount, 0) || 0,
      });

      setRecentBookings(recentData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "canceled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Kasir</h2>
        <p className="text-muted-foreground">
          Kelola booking dan artikel di sini
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_bookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending_bookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booking Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.today_bookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {summary.total_amount.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{booking.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.field.name} • {format(new Date(booking.booking_date), "dd MMMM yyyy", {
                      locale: id,
                    })}
                    {" • "}
                    {booking.start_time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Rp {booking.total_amount.toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}

            {recentBookings.length === 0 && (
              <div className="text-center text-muted-foreground">
                Belum ada booking terbaru
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}