import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  field: {
    name: string;
  };
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(\`
          *,
          field:field_id (name)
        \`)
        .order("booking_date", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Gagal mengambil data booking");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status } : booking
        )
      );

      toast.success("Status booking berhasil diupdate");
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Gagal mengupdate status booking");
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      booking.customer_phone.includes(search) ||
      booking.field.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Booking</h2>
        <p className="text-muted-foreground">
          Kelola status booking dan lihat detail booking
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Cari nama, telepon, atau lapangan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Customer</TableHead>
              <TableHead>Lapangan</TableHead>
              <TableHead>Tanggal & Waktu</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.customer_phone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{booking.field.name}</TableCell>
                <TableCell>
                  <div>
                    <p>
                      {format(new Date(booking.booking_date), "dd MMMM yyyy", {
                        locale: id,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.start_time} - {booking.end_time}
                    </p>
                  </div>
                </TableCell>
                <TableCell>Rp {booking.total_amount.toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={\`inline-flex rounded-full px-2 py-1 text-xs font-medium \${getStatusColor(
                      booking.status
                    )}\`}
                  >
                    {booking.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    Update Status
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredBookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Tidak ada data booking
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status Booking</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="font-medium">{selectedBooking?.customer_name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedBooking?.field.name} •{" "}
                {selectedBooking?.booking_date &&
                  format(new Date(selectedBooking.booking_date), "dd MMMM yyyy", {
                    locale: id,
                  })}
              </p>
            </div>

            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  selectedBooking &&
                  updateBookingStatus(selectedBooking.id, "pending")
                }
              >
                Set Pending
              </Button>
              <Button
                variant="default"
                onClick={() =>
                  selectedBooking &&
                  updateBookingStatus(selectedBooking.id, "paid")
                }
              >
                Set Paid
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedBooking &&
                  updateBookingStatus(selectedBooking.id, "canceled")
                }
              >
                Set Canceled
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}