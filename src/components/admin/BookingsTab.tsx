import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  fields: {
    name: string;
  };
}

const BookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookings")
      .select(`
        *,
        fields (name)
      `)
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false });

    if (data) setBookings(data);
    setLoading(false);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: "pending" | "paid" | "canceled") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      toast.error("Gagal mengubah status: " + error.message);
      return;
    }

    toast.success("Status booking berhasil diubah");
    fetchBookings();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-500",
      paid: "bg-green-500/10 text-green-500",
      canceled: "bg-red-500/10 text-red-500",
    };

    const labels = {
      pending: "Pending",
      paid: "Lunas",
      canceled: "Dibatalkan",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || ""}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Booking</CardTitle>
        <CardDescription>
          Kelola semua booking lapangan yang masuk
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Pelanggan:</span>
                      <p className="font-medium">{booking.customer_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">WhatsApp:</span>
                      <p className="font-medium">{booking.customer_phone}</p>
                    </div>
                    {booking.customer_email && (
                      <div>
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <p className="font-medium">{booking.customer_email}</p>
                      </div>
                    )}
                    {booking.notes && (
                      <div>
                        <span className="text-sm text-muted-foreground">Catatan:</span>
                        <p className="text-sm">{booking.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Lapangan:</span>
                      <p className="font-medium">{booking.fields.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Tanggal:</span>
                      <p className="font-medium">
                        {format(new Date(booking.booking_date), "dd MMMM yyyy", { locale: id })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Waktu:</span>
                      <p className="font-medium">
                        {booking.start_time} - {booking.end_time}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Total:</span>
                      <p className="text-lg font-bold text-primary">
                        Rp {booking.total_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {getStatusBadge(booking.status)}
                  </div>

                  <Select
                    value={booking.status}
                    onValueChange={(value) => updateBookingStatus(booking.id, value as "pending" | "paid" | "canceled")}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Lunas</SelectItem>
                      <SelectItem value="canceled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}

          {bookings.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Belum ada booking masuk
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingsTab;
