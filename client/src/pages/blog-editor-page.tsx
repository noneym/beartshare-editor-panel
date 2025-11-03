import { useState } from "react";
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

export default function BlogEditorPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    console.log("Save blog:", { title, category, content });
  };

  const handlePreview = () => {
    console.log("Preview blog:", { title, category, content });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-2">Blog Yazısı Oluştur</h1>
          <p className="text-muted-foreground">Yeni bir blog yazısı oluşturun.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview} data-testid="button-preview">
            <Eye className="w-4 h-4 mr-2" />
            Önizle
          </Button>
          <Button onClick={handleSave} data-testid="button-save">
            <Save className="w-4 h-4 mr-2" />
            Kaydet
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
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11" data-testid="select-category">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teknoloji">Teknoloji</SelectItem>
              <SelectItem value="programlama">Programlama</SelectItem>
              <SelectItem value="tasarim">Tasarım</SelectItem>
              <SelectItem value="yapay-zeka">Yapay Zeka</SelectItem>
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
