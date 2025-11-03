import { CategoryManager } from "@/components/category-manager";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BlogCategory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Categories() {
  const { toast } = useToast();

  const { data: categories = [], isLoading } = useQuery<(BlogCategory & { postCount?: number })[]>({
    queryKey: ["/api/blog-categories"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const res = await apiRequest("POST", "/api/blog-categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-categories"] });
      toast({
        title: "Başarılı",
        description: "Kategori oluşturuldu.",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name: string; slug: string } }) => {
      const res = await apiRequest("PUT", `/api/blog-categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-categories"] });
      toast({
        title: "Başarılı",
        description: "Kategori güncellendi.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/blog-categories/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-categories"] });
      toast({
        title: "Başarılı",
        description: "Kategori silindi.",
      });
    },
  });

  const formattedCategories = categories.map(cat => ({
    id: cat.id.toString(),
    name: cat.name,
    slug: cat.slug,
    postCount: cat.postCount || 0,
  }));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Blog Kategorileri</h1>
        <p className="text-muted-foreground">Blog yazılarınız için kategoriler oluşturun ve yönetin.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
      ) : (
        <CategoryManager
          categories={formattedCategories}
          onAdd={(cat) => addMutation.mutate(cat)}
          onEdit={(id, cat) => editMutation.mutate({ id: parseInt(id), data: cat })}
          onDelete={(id) => {
            if (confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
              deleteMutation.mutate(parseInt(id));
            }
          }}
        />
      )}
    </div>
  );
}
