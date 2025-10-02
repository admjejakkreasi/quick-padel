import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-padel.jpg";

interface Field {
  id: string;
  name: string;
  description: string | null;
  price_per_hour: number;
  image_url: string | null;
}

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  created_at: string;
}

const Index = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchFields();
    fetchArticles();
  }, []);

  const fetchFields = async () => {
    const { data } = await supabase
      .from("fields")
      .select("*")
      .eq("is_active", true)
      .limit(3);
    
    if (data) setFields(data);
  };

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(3);
    
    if (data) setArticles(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/30" />
        </div>
        
        <div className="container relative flex h-full items-center">
          <div className="max-w-2xl space-y-6">
            <Badge className="bg-accent text-accent-foreground">
              Premium Padel Experience
            </Badge>
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Booking Lapangan Padel
              <span className="block text-primary">Mudah & Cepat</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Nikmati pengalaman bermain padel di lapangan berkualitas premium. 
              Booking online dalam hitungan menit, main langsung!
            </p>
            <div className="flex gap-4">
              <Link to="/booking">
                <Button size="lg" className="group">
                  Booking Sekarang
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="border-primary/20 transition-shadow hover:shadow-lg">
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary" />
              <CardTitle>Booking Online</CardTitle>
              <CardDescription>
                Pilih tanggal & jam yang sesuai dengan jadwal Anda
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-primary/20 transition-shadow hover:shadow-lg">
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary" />
              <CardTitle>Lokasi Strategis</CardTitle>
              <CardDescription>
                Lapangan premium di lokasi mudah diakses
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="border-primary/20 transition-shadow hover:shadow-lg">
            <CardHeader>
              <Clock className="h-10 w-10 text-primary" />
              <CardTitle>Fleksibel</CardTitle>
              <CardDescription>
                Tersedia dari pagi hingga malam, sesuai kebutuhan Anda
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Courts Section */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Lapangan Kami</h2>
          <p className="text-muted-foreground">
            Lapangan berkualitas premium untuk pengalaman bermain terbaik
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {fields.map((field) => (
            <Card key={field.id} className="overflow-hidden transition-all hover:shadow-xl">
              {field.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={field.image_url} 
                    alt={field.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{field.name}</CardTitle>
                <CardDescription>{field.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    Rp {field.price_per_hour.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground">/jam</span>
                  </span>
                  <Link to="/booking">
                    <Button>Booking</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Articles Section */}
      {articles.length > 0 && (
        <section className="container py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Artikel & Promo</h2>
            <p className="text-muted-foreground">
              Tips, berita terkini, dan promo menarik seputar padel
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden transition-all hover:shadow-xl">
                {article.image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Padel Booking. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
