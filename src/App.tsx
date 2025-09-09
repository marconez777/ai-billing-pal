import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import DashboardPage from "./pages/dashboard/index";
import BillingPage from "./pages/billing/index";  
import AdminPage from "./pages/admin/index";
import ImportsPage from "./pages/imports/index";
import TransactionsPage from "./pages/transactions/index";
import InvoicesPage from "./pages/invoices/index";
import RecurringPage from "./pages/recurring/index";
import RulesPage from "./pages/rules/index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <AuthGuard>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </AuthGuard>
          } />
          <Route path="/billing" element={
            <AuthGuard>
              <DashboardLayout>
                <BillingPage />
              </DashboardLayout>
            </AuthGuard>
          } />
          <Route path="/admin" element={
            <AdminGuard>
              <DashboardLayout>
                <AdminPage />
              </DashboardLayout>
            </AdminGuard>
          } />
          <Route path="/imports" element={
            <AuthGuard>
              <DashboardLayout>
                <ImportsPage />
              </DashboardLayout>
            </AuthGuard>
          } />
          <Route path="/transactions" element={
            <AuthGuard>
              <DashboardLayout>
                <TransactionsPage />
              </DashboardLayout>
            </AuthGuard>
          } />
          <Route path="/invoices" element={
            <AuthGuard>
              <DashboardLayout>
                <InvoicesPage />
              </DashboardLayout>
            </AuthGuard>
          } />
          <Route path="/recurring" element={
            <AuthGuard>
              <DashboardLayout>
                <RecurringPage />
              </DashboardLayout>
            </AuthGuard>
          } />
          <Route path="/rules" element={
            <AuthGuard>
              <DashboardLayout>
                <RulesPage />
              </DashboardLayout>
            </AuthGuard>
          } />
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
