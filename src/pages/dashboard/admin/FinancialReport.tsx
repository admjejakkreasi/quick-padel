import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialData {
  date: string;
  total_revenue: number;
  total_bookings: number;
}

export default function FinancialReport() {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [data, setData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      let query = supabase.from("bookings").select("*").eq("status", "paid");

      if (period === "daily") {
        const startDate = format(subDays(new Date(), 30), "yyyy-MM-dd");
        query = query.gte("booking_date", startDate);
      } else {
        const startDate = format(subMonths(new Date(), 12), "yyyy-MM");
        query = query.gte("booking_date", startDate);
      }

      const { data: bookings, error } = await query;

      if (error) throw error;

      // Process data
      const processedData = processBookingData(bookings, period);
      setData(processedData);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error("Gagal mengambil data keuangan");
    } finally {
      setLoading(false);
    }
  };

  const processBookingData = (bookings: any[], periodType: "daily" | "monthly") => {
    const dataMap = new Map<string, FinancialData>();

    bookings.forEach((booking) => {
      const date = periodType === "daily"
        ? format(new Date(booking.booking_date), "yyyy-MM-dd")
        : format(new Date(booking.booking_date), "yyyy-MM");

      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          total_revenue: 0,
          total_bookings: 0,
        });
      }

      const current = dataMap.get(date)!;
      current.total_revenue += booking.total_amount;
      current.total_bookings += 1;
    });

    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const chartData = {
    labels: data.map((item) =>
      period === "daily"
        ? format(new Date(item.date), "dd MMM", { locale: id })
        : format(new Date(item.date + "-01"), "MMMM yyyy", { locale: id })
    ),
    datasets: [
      {
        label: "Pendapatan",
        data: data.map((item) => item.total_revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        yAxisID: "y",
      },
      {
        label: "Jumlah Booking",
        data: data.map((item) => item.total_bookings),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: "Grafik Pendapatan dan Jumlah Booking",
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Pendapatan (Rp)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Jumlah Booking",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Tanggal:
          period === "daily"
            ? format(new Date(item.date), "dd MMMM yyyy", { locale: id })
            : format(new Date(item.date + "-01"), "MMMM yyyy", { locale: id }),
        "Total Pendapatan": item.total_revenue,
        "Jumlah Booking": item.total_bookings,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");

    const fileName = \`laporan-keuangan-\${period}-\${format(
      new Date(),
      "yyyy-MM-dd"
    )}.xlsx\`;

    XLSX.writeFile(wb, fileName);
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.total_revenue, 0);
  const totalBookings = data.reduce((sum, item) => sum + item.total_bookings, 0);
  const averageRevenue =
    data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Laporan Keuangan
          </h2>
          <p className="text-muted-foreground">
            Analisis pendapatan dan booking
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value: "daily" | "monthly") => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBookings.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Pendapatan {period === "daily" ? "per Hari" : "per Bulan"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {averageRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grafik {period === "daily" ? "Harian" : "Bulanan"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line options={chartOptions} data={chartData} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jumlah Booking</TableHead>
                  <TableHead className="text-right">Total Pendapatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell>
                      {period === "daily"
                        ? format(new Date(item.date), "dd MMMM yyyy", {
                            locale: id,
                          })
                        : format(new Date(item.date + "-01"), "MMMM yyyy", {
                            locale: id,
                          })}
                    </TableCell>
                    <TableCell>{item.total_bookings}</TableCell>
                    <TableCell className="text-right">
                      Rp {item.total_revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}

                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}