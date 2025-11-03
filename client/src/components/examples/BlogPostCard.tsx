import { BlogPostCard } from "../blog-post-card";

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
];

export default function BlogPostCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {mockPosts.map((post) => (
        <BlogPostCard
          key={post.id}
          {...post}
          onEdit={(id) => console.log("Edit post:", id)}
          onDelete={(id) => console.log("Delete post:", id)}
          onView={(id) => console.log("View post:", id)}
        />
      ))}
    </div>
  );
}
