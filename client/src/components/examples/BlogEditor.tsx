import { BlogEditor } from "../blog-editor";

export default function BlogEditorExample() {
  return (
    <div className="p-6">
      <h3 className="font-bold mb-4">Blog Editör</h3>
      <BlogEditor
        initialContent="<h1>Blog Başlığı</h1><p>Buraya içeriğinizi yazabilirsiniz...</p>"
        onChange={(html) => console.log("Content changed:", html)}
      />
    </div>
  );
}
