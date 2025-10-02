import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const SettingsTab = () => {
  const [loading, setLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string>("");
  const [formData, setFormData] = useState({
    site_name: "",
    site_logo_url: "",
    hero_banner_url: "",
    whatsapp_number: "",
    qris_image_url: "",
    payment_instructions: "",
    webhook_url: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("settings")
      .select("*")
      .single();

    if (data) {
      setSettingsId(data.id);
      setFormData({
        site_name: data.site_name || "",
        site_logo_url: data.site_logo_url || "",
        hero_banner_url: data.hero_banner_url || "",
        whatsapp_number: data.whatsapp_number || "",
        qris_image_url: data.qris_image_url || "",
        payment_instructions: data.payment_instructions || "",
        webhook_url: data.webhook_url || "",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("settings")
      .update({
        site_name: formData.site_name,
        site_logo_url: formData.site_logo_url || null,
        hero_banner_url: formData.hero_banner_url || null,
        whatsapp_number: formData.whatsapp_number || null,
        qris_image_url: formData.qris_image_url || null,
        payment_instructions: formData.payment_instructions || null,
        webhook_url: formData.webhook_url || null,
      })
      .eq("id", settingsId);

    if (error) {
      toast.error("Gagal menyimpan pengaturan");
      return;
    }

    toast.success("Pengaturan berhasil disimpan");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Website</CardTitle>
        <CardDescription>
          Kelola pengaturan umum website
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="site_name">Nama Website</Label>
            <Input
              id="site_name"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="site_logo_url">URL Logo Website</Label>
            <Input
              id="site_logo_url"
              type="url"
              value={formData.site_logo_url}
              onChange={(e) => setFormData({ ...formData, site_logo_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="hero_banner_url">URL Banner Hero</Label>
            <Input
              id="hero_banner_url"
              type="url"
              value={formData.hero_banner_url}
              onChange={(e) => setFormData({ ...formData, hero_banner_url: e.target.value })}
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Banner utama yang ditampilkan di halaman depan
            </p>
          </div>

          <div>
            <Label htmlFor="whatsapp_number">Nomor WhatsApp Admin</Label>
            <Input
              id="whatsapp_number"
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="628123456789"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Format: 628xxxxxxxxx (tanpa spasi atau tanda +)
            </p>
          </div>

          <div>
            <Label htmlFor="qris_image_url">URL Gambar QRIS</Label>
            <Input
              id="qris_image_url"
              type="url"
              value={formData.qris_image_url}
              onChange={(e) => setFormData({ ...formData, qris_image_url: e.target.value })}
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Upload QRIS Anda ke hosting gambar (seperti imgur.com) dan paste URL-nya di sini
            </p>
          </div>

          <div>
            <Label htmlFor="payment_instructions">Instruksi Pembayaran</Label>
            <Textarea
              id="payment_instructions"
              value={formData.payment_instructions}
              onChange={(e) => setFormData({ ...formData, payment_instructions: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="webhook_url">URL Webhook (n8n)</Label>
            <Input
              id="webhook_url"
              type="url"
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Webhook untuk integrasi notifikasi otomatis
            </p>
          </div>

          <Button type="submit" className="w-full">
            Simpan Pengaturan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsTab;
