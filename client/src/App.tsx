import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import UserDetail from "@/pages/user-detail";
import SendEmail from "@/pages/send-email";
import SendSMS from "@/pages/send-sms";
import BlogPosts from "@/pages/blog-posts";
import Categories from "@/pages/categories";
import BlogEditorPage from "@/pages/blog-editor-page";
import EmailTemplates from "@/pages/email-templates";
import EmailTemplateEditor from "@/pages/email-template-editor";
import Login from "@/pages/login";

function AppContent() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [location] = useLocation();
  
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  // If not authenticated and not on login page, show login
  if (!isAuthenticated && location !== "/login") {
    return <Login />;
  }

  // If authenticated and on login page, redirect to dashboard
  if (isAuthenticated && location === "/login") {
    return <Redirect to="/" />;
  }

  // Login page
  if (location === "/login") {
    return <Login />;
  }

  // Protected routes with sidebar
  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Çıkış Yap"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/users" component={Users} />
              <Route path="/users/:id" component={UserDetail} />
              <Route path="/send-email" component={SendEmail} />
              <Route path="/send-sms" component={SendSMS} />
              <Route path="/email-templates" component={EmailTemplates} />
              <Route path="/email-templates/new" component={EmailTemplateEditor} />
              <Route path="/email-templates/edit/:id" component={EmailTemplateEditor} />
              <Route path="/blog-posts" component={BlogPosts} />
              <Route path="/blog-posts/new" component={BlogEditorPage} />
              <Route path="/blog-editor/:id" component={BlogEditorPage} />
              <Route path="/categories" component={Categories} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
