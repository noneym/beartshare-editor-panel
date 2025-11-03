import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import SendEmail from "@/pages/send-email";
import SendSMS from "@/pages/send-sms";
import BlogPosts from "@/pages/blog-posts";
import Categories from "@/pages/categories";
import BlogEditorPage from "@/pages/blog-editor-page";
import EmailTemplates from "@/pages/email-templates";
import EmailTemplateEditor from "@/pages/email-template-editor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/users" component={Users} />
      <Route path="/send-email" component={SendEmail} />
      <Route path="/send-sms" component={SendSMS} />
      <Route path="/email-templates" component={EmailTemplates} />
      <Route path="/email-templates/new" component={EmailTemplateEditor} />
      <Route path="/email-templates/edit/:id" component={EmailTemplateEditor} />
      <Route path="/blog-posts" component={BlogPosts} />
      <Route path="/blog-posts/new" component={BlogEditorPage} />
      <Route path="/categories" component={Categories} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b border-border bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-y-auto">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
