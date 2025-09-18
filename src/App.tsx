import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/shared/Layout";
import HomePage from "./pages/HomePage";
import DurationPage from "./pages/DurationPage";
import PaymentPage from "./pages/PaymentPage";
import SmsConfirmationPage from "./pages/SmsConfirmationPage";
import PushConfirmationPage from "./pages/PushConfirmationPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import AdminAuthPage from "./pages/AdminAuthPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ContactPage from "./pages/ContactPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/duration" element={<DurationPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/sms-confirmation" element={<SmsConfirmationPage />} />
          <Route path="/push-confirmation" element={<PushConfirmationPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/success" element={<ConfirmationPage />} />
            <Route path="/admin/auth" element={<AdminAuthPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
