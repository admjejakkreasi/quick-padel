import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import BookingsTab from "@/components/admin/BookingsTab";
import FieldsTab from "@/components/admin/FieldsTab";
import ArticlesTab from "@/components/admin/ArticlesTab";
import SettingsTab from "@/components/admin/SettingsTab";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      toast.error("Akses ditolak");
      navigate("/admin/login");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logout berhasil");
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Booking</TabsTrigger>
            <TabsTrigger value="fields">Lapangan</TabsTrigger>
            <TabsTrigger value="articles">Artikel</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="fields">
            <FieldsTab />
          </TabsContent>

          <TabsContent value="articles">
            <ArticlesTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
