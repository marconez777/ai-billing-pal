import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
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
import EntitiesPage from "./pages/entities/index";
import AccountsPage from "./pages/accounts/index";
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
              <SubscriptionGuard>
                <DashboardLayout>
                  <ImportsPage />
                </DashboardLayout>
              </SubscriptionGuard>
            </AuthGuard>
          } />
          <Route path="/transactions" element={
            <AuthGuard>
              <SubscriptionGuard>
                <DashboardLayout>
                  <TransactionsPage />
                </DashboardLayout>
              </SubscriptionGuard>
            </AuthGuard>
          } />
          <Route path="/invoices" element={
            <AuthGuard>
              <SubscriptionGuard>
                <DashboardLayout>
                  <InvoicesPage />
                </DashboardLayout>
              </SubscriptionGuard>
            </AuthGuard>
          } />
          <Route path="/recurring" element={
            <AuthGuard>
              <SubscriptionGuard>
                <DashboardLayout>
                  <RecurringPage />
                </DashboardLayout>
              </SubscriptionGuard>
            </AuthGuard>
          } />
          <Route path="/rules" element={
            <AuthGuard>
              <SubscriptionGuard>
                <DashboardLayout>
                  <RulesPage />
                </DashboardLayout>
              </SubscriptionGuard>
            </AuthGuard>
          } />
          <Route path="/entities" element={
            <AuthGuard>
              <SubscriptionGuard>
                <DashboardLayout>
                  <EntitiesPage />
                </DashboardLayout>
              </SubscriptionGuard>
            </AuthGuard>
          } />
          <Route path="/accounts" element={
            <AuthGuard>
              <SubscriptionGuard>
                <DashboardLayout>
                  <AccountsPage />
                </DashboardLayout>
              </SubscriptionGuard>
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
