import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Field {
  id: string;
  name: string;
  description: string | null;
  price_per_hour: number;
  image_url: string | null;
  is_active: boolean;
}

const FieldsTab = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_hour: "",
    image_url: "",
  });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    const { data } = await supabase
      .from("fields")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setFields(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldData = {
      name: formData.name,
      description: formData.description || null,
      price_per_hour: parseFloat(formData.price_per_hour),
      image_url: formData.image_url || null,
    };

    if (editingField) {
      const { error } = await supabase
        .from("fields")
        .update(fieldData)
        .eq("id", editingField.id);

      if (error) {
        toast.error("Gagal mengupdate lapangan");
        return;
      }

      toast.success("Lapangan berhasil diupdate");
    } else {
      const { error } = await supabase
        .from("fields")
        .insert(fieldData);

      if (error) {
        toast.error("Gagal menambah lapangan");
        return;
      }

      toast.success("Lapangan berhasil ditambahkan");
    }

    resetForm();
    fetchFields();
    setIsDialogOpen(false);
  };

  const handleEdit = (field: Field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      description: field.description || "",
      price_per_hour: field.price_per_hour.toString(),
      image_url: field.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus lapangan ini?")) return;

    const { error } = await supabase
      .from("fields")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus lapangan");
      return;
    }

    toast.success("Lapangan berhasil dihapus");
    fetchFields();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price_per_hour: "",
      image_url: "",
    });
    setEditingField(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manajemen Lapangan</CardTitle>
            <CardDescription>Kelola lapangan yang tersedia</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Lapangan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingField ? "Edit Lapangan" : "Tambah Lapangan Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Lapangan *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Harga per Jam (Rp) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price_per_hour}
                    onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">URL Gambar</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingField ? "Update" : "Tambah"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {field.image_url && (
                    <img
                      src={field.image_url}
                      alt={field.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{field.name}</h3>
                    <p className="text-sm text-muted-foreground">{field.description}</p>
                    <p className="mt-2 text-xl font-bold text-primary">
                      Rp {field.price_per_hour.toLocaleString()}/jam
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {fields.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Belum ada lapangan ditambahkan
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldsTab;
