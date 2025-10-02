import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Field {
  id: string;
  name: string;
  price_per_hour: number;
  image_url: string | null;
}

const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00"
];

const Booking = () => {
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [duration, setDuration] = useState<number>(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    if (selectedField && selectedDate) {
      fetchBookedSlots();
    }
  }, [selectedField, selectedDate]);

  const fetchFields = async () => {
    const { data } = await supabase
      .from("fields")
      .select("*")
      .eq("is_active", true);
    
    if (data && data.length > 0) {
      setFields(data);
      setSelectedField(data[0].id);
    }
  };

  const fetchBookedSlots = async () => {
    if (!selectedField || !selectedDate) return;

    const { data } = await supabase
      .from("bookings")
      .select("start_time")
      .eq("field_id", selectedField)
      .eq("booking_date", format(selectedDate, "yyyy-MM-dd"))
      .neq("status", "canceled");

    if (data) {
      setBookedSlots(data.map(b => b.start_time));
    }
  };

  const calculateTotal = () => {
    const field = fields.find(f => f.id === selectedField);
    return field ? field.price_per_hour * duration : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedField || !selectedDate || !selectedTime || !customerName || !customerPhone) {
      toast.error("Mohon lengkapi semua data yang diperlukan");
      return;
    }

    const startHour = parseInt(selectedTime.split(":")[0]);
    const endHour = startHour + duration;
    const endTime = `${endHour.toString().padStart(2, "0")}:00`;

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        field_id: selectedField,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedTime,
        end_time: endTime,
        total_amount: calculateTotal(),
        notes: notes || null,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      toast.error("Gagal membuat booking: " + error.message);
      return;
    }

    if (data) {
      navigate("/payment", { state: { bookingId: data.id } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold">Booking Lapangan</h1>
            <p className="text-muted-foreground">
              Pilih lapangan, tanggal, dan waktu yang sesuai
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Field Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Pilih Lapangan</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedField} onValueChange={setSelectedField}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {fields.map((field) => (
                      <div key={field.id} className="relative">
                        <RadioGroupItem
                          value={field.id}
                          id={field.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={field.id}
                          className="flex cursor-pointer flex-col items-start rounded-lg border-2 border-muted p-4 hover:border-primary peer-data-[state=checked]:border-primary"
                        >
                          <span className="font-semibold">{field.name}</span>
                          <span className="text-sm text-muted-foreground">
                            Rp {field.price_per_hour.toLocaleString()}/jam
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Tanggal & Waktu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block">Pilih Tanggal</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border"
                    locale={id}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="time">Jam Mulai</Label>
                    <select
                      id="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
                      required
                    >
                      <option value="">Pilih jam</option>
                      {timeSlots.map((time) => (
                        <option 
                          key={time} 
                          value={time}
                          disabled={bookedSlots.includes(time)}
                        >
                          {time} {bookedSlots.includes(time) ? "(Sudah dibooking)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Durasi (jam)</Label>
                    <select
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
                      required
                    >
                      {[1, 2, 3, 4].map((d) => (
                        <option key={d} value={d}>{d} jam</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Data Pemesan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Nomor WhatsApp *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email (opsional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal:</span>
                    <span className="font-medium">
                      {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: id }) : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waktu:</span>
                    <span className="font-medium">
                      {selectedTime || "-"} ({duration} jam)
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      Rp {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full">
              Lanjut ke Pembayaran
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
