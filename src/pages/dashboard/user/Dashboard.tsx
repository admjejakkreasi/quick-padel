import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface UserBooking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  field: {
    name: string;
  };
  total_amount: number;
}

export default function UserDashboard() {
  const { profile } = useAuth();
  const [recentBookings, setRecentBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentBookings();
  }, []);

  const fetchRecentBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(\`
          id,
          booking_date,
          start_time,
          end_time,
          status,
          total_amount,
          field:field_id (name)
        \`)
        .eq("customer_id", profile?.id)
        .order("booking_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Selamat datang, {profile?.full_name}!
        </h2>
        <p className="text-muted-foreground">
          Lihat history booking dan kelola profile Anda di sini
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentBookings.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{booking.field.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.booking_date), "dd MMMM yyyy", {
                      locale: id,
                    })}
                    {" • "}
                    {booking.start_time} - {booking.end_time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    Rp {booking.total_amount.toLocaleString()}
                  </p>
                  <span
                    className={\`inline-flex rounded-full px-2 py-1 text-xs font-medium \${getStatusColor(
                      booking.status
                    )}\`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}

            {loading && <div>Memuat data...</div>}

            {!loading && recentBookings.length === 0 && (
              <div className="text-center text-muted-foreground">
                Belum ada history booking
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}