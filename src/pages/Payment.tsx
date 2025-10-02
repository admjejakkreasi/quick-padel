import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle2, MessageCircle } from "lucide-react";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  fields: {
    name: string;
  };
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (!bookingId) {
      navigate("/booking");
      return;
    }

    fetchBooking();
    fetchSettings();
  }, [bookingId, navigate]);

  const fetchBooking = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        fields (name)
      `)
      .eq("id", bookingId)
      .single();

    if (error) {
      toast.error("Gagal memuat data booking");
      navigate("/booking");
      return;
    }

    setBooking(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (data) setSettings(data);
  };

  const handleWhatsAppConfirmation = () => {
    if (!booking || !settings?.whatsapp_number) {
      toast.error("Nomor WhatsApp admin belum tersedia");
      return;
    }

    const message = encodeURIComponent(
      `Halo Admin, saya sudah melakukan pembayaran untuk booking:\n\n` +
      `Nama: ${booking.customer_name}\n` +
      `Lapangan: ${booking.fields.name}\n` +
      `Tanggal: ${format(new Date(booking.booking_date), "dd MMMM yyyy", { locale: id })}\n` +
      `Jam: ${booking.start_time} - ${booking.end_time}\n` +
      `Total: Rp ${booking.total_amount.toLocaleString()}\n\n` +
      `Mohon konfirmasi pembayaran saya. Terima kasih!`
    );

    const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!booking) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-4xl font-bold">Booking Berhasil!</h1>
            <p className="text-muted-foreground">
              Silakan lanjutkan dengan pembayaran
            </p>
          </div>

          {/* Booking Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detail Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama:</span>
                <span className="font-medium">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lapangan:</span>
                <span className="font-medium">{booking.fields.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal:</span>
                <span className="font-medium">
                  {format(new Date(booking.booking_date), "dd MMMM yyyy", { locale: id })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waktu:</span>
                <span className="font-medium">
                  {booking.start_time} - {booking.end_time}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-lg font-semibold">Total Pembayaran:</span>
                <span className="text-2xl font-bold text-primary">
                  Rp {booking.total_amount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Instructions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Instruksi Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings?.qris_image_url && (
                <div className="flex justify-center">
                  <img 
                    src={settings.qris_image_url} 
                    alt="QRIS Payment"
                    className="max-w-xs rounded-lg border"
                  />
                </div>
              )}

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm leading-relaxed">
                  {settings?.payment_instructions || 
                    "Silakan transfer ke nomor QRIS di atas dan konfirmasi pembayaran melalui WhatsApp admin."}
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-medium">Langkah-langkah:</p>
                <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                  <li>Scan QRIS di atas menggunakan aplikasi mobile banking/e-wallet</li>
                  <li>Masukkan nominal: Rp {booking.total_amount.toLocaleString()}</li>
                  <li>Selesaikan pembayaran</li>
                  <li>Klik tombol di bawah untuk konfirmasi via WhatsApp</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Button */}
          <div className="space-y-4">
            <Button 
              onClick={handleWhatsAppConfirmation}
              size="lg" 
              className="w-full"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Konfirmasi Pembayaran via WhatsApp
            </Button>

            <Button 
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
