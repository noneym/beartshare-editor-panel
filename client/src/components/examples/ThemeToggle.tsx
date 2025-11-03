import { ThemeToggle } from "../theme-toggle";

export default function ThemeToggleExample() {
  return (
    <div className="flex items-center justify-center h-32 gap-4">
      <ThemeToggle />
      <span className="text-sm text-muted-foreground">Tema değiştirmek için tıklayın</span>
    </div>
  );
}
