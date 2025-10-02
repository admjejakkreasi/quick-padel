import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
}

const ArticlesTab = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    is_published: false,
  });

  useEffect(() => {
    fetchArticles();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUserId(session.user.id);
  };

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setArticles(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const articleData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt || null,
      image_url: formData.image_url || null,
      is_published: formData.is_published,
      author_id: userId,
    };

    if (editingArticle) {
      const { error } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", editingArticle.id);

      if (error) {
        toast.error("Gagal mengupdate artikel");
        return;
      }

      toast.success("Artikel berhasil diupdate");
    } else {
      const { error } = await supabase
        .from("articles")
        .insert(articleData);

      if (error) {
        toast.error("Gagal menambah artikel");
        return;
      }

      toast.success("Artikel berhasil ditambahkan");
    }

    resetForm();
    fetchArticles();
    setIsDialogOpen(false);
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      image_url: article.image_url || "",
      is_published: article.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus artikel ini?")) return;

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus artikel");
      return;
    }

    toast.success("Artikel berhasil dihapus");
    fetchArticles();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      image_url: "",
      is_published: false,
    });
    setEditingArticle(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manajemen Artikel</CardTitle>
            <CardDescription>Kelola artikel dan promo</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Artikel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingArticle ? "Edit Artikel" : "Tambah Artikel Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Ringkasan</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Konten *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_published: checked })
                    }
                  />
                  <Label htmlFor="published">Publikasikan artikel</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingArticle ? "Update" : "Tambah"}
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
          {articles.map((article) => (
            <Card key={article.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{article.title}</h3>
                      {article.is_published ? (
                        <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                          Published
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-500/10 px-2 py-1 text-xs text-gray-500">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt || article.content.substring(0, 150)}...
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {format(new Date(article.created_at), "dd MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(article)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {articles.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Belum ada artikel ditambahkan
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArticlesTab;
