import { CategoryManager } from "@/components/category-manager";

export default function Categories() {
  const mockCategories = [
    { id: "1", name: "Teknoloji", slug: "teknoloji", postCount: 15 },
    { id: "2", name: "Programlama", slug: "programlama", postCount: 23 },
    { id: "3", name: "Tasarım", slug: "tasarim", postCount: 8 },
    { id: "4", name: "Yapay Zeka", slug: "yapay-zeka", postCount: 12 },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Blog Kategorileri</h1>
        <p className="text-muted-foreground">Blog yazılarınız için kategoriler oluşturun ve yönetin.</p>
      </div>

      <CategoryManager
        categories={mockCategories}
        onAdd={(cat) => console.log("Add category:", cat)}
        onEdit={(id, cat) => console.log("Edit category:", id, cat)}
        onDelete={(id) => console.log("Delete category:", id)}
      />
    </div>
  );
}
