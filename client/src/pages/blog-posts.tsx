import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogPostCard } from "@/components/blog-post-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogPost, BlogCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function BlogPosts() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog-posts"],
  });

  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog-categories"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/blog-posts/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({
        title: "Başarılı",
        description: "Blog yazısı silindi.",
      });
    },
  });

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Kategorisiz";
    const category = categories.find(c => c.id === categoryId);
    return category?.title || "Kategorisiz";
  };

  const formattedPosts = posts.map(post => ({
    id: post.id.toString(),
    title: post.title,
    excerpt: post.content.substring(0, 150).replace(/<[^>]*>/g, ''),
    category: getCategoryName(post.category),
    date: post.created_at ? new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    status: (post.status || 'draft') as 'published' | 'draft',
  }));

  const filteredPosts = formattedPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-2">Blog Yazıları</h1>
          <p className="text-muted-foreground">Blog yazılarınızı oluşturun ve yönetin.</p>
        </div>
        <Button onClick={() => setLocation("/blog/new")} data-testid="button-new-post">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Yazı
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Blog yazısı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-posts"
          />
        </div>
      </div>

      {postsLoading ? (
        <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogPostCard
              key={post.id}
              {...post}
              onEdit={(id) => setLocation(`/blog/edit/${id}`)}
              onDelete={(id) => {
                if (confirm("Bu yazıyı silmek istediğinizden emin misiniz?")) {
                  deleteMutation.mutate(parseInt(id));
                }
              }}
              onView={(id) => setLocation(`/blog/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
