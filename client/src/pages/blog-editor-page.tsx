import { useState, useEffect, useRef } from "react";
import { Save, Eye, Upload, X } from "lucide-react";
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
import { AdvancedBlogEditor } from "@/components/advanced-blog-editor";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogCategory, BlogPost } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";

export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

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
      setCategoryId(post.category?.toString() || "");
      setContent(post.content);
      
      // Convert database status (0/1) to dropdown format (draft/published)
      if (post.status === "1" || post.status === 1 || post.status === "published" || post.status === "Yayında") {
        setStatus("published");
      } else if (post.status === "0" || post.status === 0 || post.status === "draft" || post.status === "Taslak") {
        setStatus("draft");
      } else {
        setStatus("draft"); // Default fallback
      }
      
      setImageUrl(post.image || "");
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category?: number; status: string; image?: string }) => {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu çok büyük (max 10MB)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      setImageUrl(data.url);

      toast({
        title: "Başarılı",
        description: "Cover fotoğrafı yüklendi",
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Hata",
        description: "Resim yüklenirken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      category: categoryId ? parseInt(categoryId) : undefined,
      status,
      image: imageUrl || undefined,
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
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.title}
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
          <Label className="text-sm font-medium mb-2 block">
            Cover Fotoğrafı
          </Label>
          <div className="space-y-3">
            {imageUrl && (
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Cover"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                  data-testid="img-cover-preview"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl("")}
                  data-testid="button-remove-cover"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="input-cover-file"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                data-testid="button-upload-cover"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Yükleniyor..." : imageUrl ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPG, PNG veya WebP (max 10MB)
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">İçerik</Label>
          <AdvancedBlogEditor
            initialContent={content}
            onChange={setContent}
          />
        </div>
      </div>
    </div>
  );
}
