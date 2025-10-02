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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  author: {
    full_name: string;
  };
}

export default function ArticleManagement() {
  const { profile } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    is_published: false,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select(\`
          *,
          author:author_id (full_name)
        \`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Gagal mengambil data artikel");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      is_published: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      is_published: article.is_published || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedArticle) {
        // Update
        const { error } = await supabase
          .from("articles")
          .update({
            title: formData.title,
            content: formData.content,
            excerpt: formData.excerpt || null,
            is_published: formData.is_published,
          })
          .eq("id", selectedArticle.id);

        if (error) throw error;
        toast.success("Artikel berhasil diupdate");
      } else {
        // Create
        const { error } = await supabase.from("articles").insert({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt || null,
          is_published: formData.is_published,
          author_id: profile?.id,
        });

        if (error) throw error;
        toast.success("Artikel berhasil dibuat");
      }

      setIsDialogOpen(false);
      fetchArticles();
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Gagal menyimpan artikel");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;

    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);

      if (error) throw error;
      toast.success("Artikel berhasil dihapus");
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Gagal menghapus artikel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Manajemen Artikel
          </h2>
          <p className="text-muted-foreground">
            Kelola artikel dan konten website
          </p>
        </div>

        <Button onClick={handleCreate}>Tambah Artikel</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Judul</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell>{article.title}</TableCell>
                <TableCell>{article.author.full_name}</TableCell>
                <TableCell>
                  <span
                    className={\`inline-flex rounded-full px-2 py-1 text-xs font-medium \${
                      article.is_published
                        ? "text-green-600 bg-green-50"
                        : "text-yellow-600 bg-yellow-50"
                    }\`}
                  >
                    {article.is_published ? "Published" : "Draft"}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(article.created_at), "dd MMMM yyyy", {
                    locale: id,
                  })}
                </TableCell>
                <TableCell>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(article)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {articles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Belum ada artikel
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedArticle ? "Edit Artikel" : "Tambah Artikel"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Konten</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={10}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_published: checked }))
                }
              />
              <Label>Publish artikel</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmit}>Simpan</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}