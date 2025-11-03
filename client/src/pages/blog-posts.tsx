import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlogPostCard } from "@/components/blog-post-card";

export default function BlogPosts() {
  const [searchQuery, setSearchQuery] = useState("");

  const mockPosts = [
    {
      id: "1",
      title: "React ile Modern Web Uygulamaları Geliştirme",
      excerpt: "React, kullanıcı arayüzleri oluşturmak için kullanılan popüler bir JavaScript kütüphanesidir. Bu yazıda React'in temellerini öğreneceksiniz.",
      category: "Teknoloji",
      date: "15 Ekim 2024",
      status: "published" as const,
    },
    {
      id: "2",
      title: "TypeScript Neden Önemli?",
      excerpt: "TypeScript, JavaScript'e tip güvenliği ekleyen bir programlama dilidir. Büyük projelerde hata oranını düşürür.",
      category: "Programlama",
      date: "10 Ekim 2024",
      status: "draft" as const,
    },
    {
      id: "3",
      title: "CSS Grid ile Responsive Tasarım",
      excerpt: "CSS Grid, modern web tasarımında layout oluşturmak için güçlü bir araçtır. Responsive tasarımlar yapmanızı kolaylaştırır.",
      category: "Tasarım",
      date: "5 Ekim 2024",
      status: "published" as const,
    },
  ];

  const filteredPosts = mockPosts.filter(
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
        <Button data-testid="button-new-post">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <BlogPostCard
            key={post.id}
            {...post}
            onEdit={(id) => console.log("Edit post:", id)}
            onDelete={(id) => console.log("Delete post:", id)}
            onView={(id) => console.log("View post:", id)}
          />
        ))}
      </div>
    </div>
  );
}
