import { useState, useEffect } from "react";
import { Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogEditor } from "@/components/blog-editor";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogCategory, BlogPost } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";

export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string>("draft");

  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog-categories"],
  });

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog-posts", id],
    enabled: !!id,
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setCategoryId(post.category_id?.toString() || "");
      setContent(post.content);
      setStatus(post.status || "draft");
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category_id?: number; status: string }) => {
      if (id) {
        const res = await apiRequest("PUT", `/api/blog-posts/${id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/blog-posts", data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Başarılı",
        description: id ? "Blog yazısı güncellendi." : "Blog yazısı oluşturuldu.",
      });
      setLocation("/blog-posts");
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Blog yazısı kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!title || !content) {
      toast({
        title: "Hata",
        description: "Başlık ve içerik zorunludur.",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      title,
      content,
      category_id: categoryId ? parseInt(categoryId) : undefined,
      status,
    });
  };

  const handlePreview = () => {
    console.log("Preview blog:", { title, categoryId, content, status });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-2">{id ? "Blog Yazısını Düzenle" : "Blog Yazısı Oluştur"}</h1>
          <p className="text-muted-foreground">{id ? "Mevcut blog yazısını düzenleyin." : "Yeni bir blog yazısı oluşturun."}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview} data-testid="button-preview">
            <Eye className="w-4 h-4 mr-2" />
            Önizle
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-sm font-medium mb-2 block">
            Başlık
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog yazısının başlığı..."
            className="text-xl font-bold h-12"
            data-testid="input-title"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium mb-2 block">
            Kategori
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-11" data-testid="select-category">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Kategorisiz</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status" className="text-sm font-medium mb-2 block">
            Durum
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11" data-testid="select-status">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="published">Yayında</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">İçerik</Label>
          <BlogEditor
            initialContent={content}
            onChange={setContent}
          />
        </div>
      </div>
    </div>
  );
}
