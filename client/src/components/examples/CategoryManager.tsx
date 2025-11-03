import { CategoryManager } from "../category-manager";

const mockCategories = [
  { id: "1", name: "Teknoloji", slug: "teknoloji", postCount: 15 },
  { id: "2", name: "Programlama", slug: "programlama", postCount: 23 },
  { id: "3", name: "Tasarım", slug: "tasarim", postCount: 8 },
];

export default function CategoryManagerExample() {
  return (
    <div className="p-6">
      <CategoryManager
        categories={mockCategories}
        onAdd={(cat) => console.log("Add category:", cat)}
        onEdit={(id, cat) => console.log("Edit category:", id, cat)}
        onDelete={(id) => console.log("Delete category:", id)}
      />
    </div>
  );
}
