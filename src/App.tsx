import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TRPCProvider } from "@/providers/TRPCProvider";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DocumentsList from "./pages/DocumentsList";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentDetail from "./pages/DocumentDetail";
import TenantManagement from "./pages/TenantManagement";
import Plans from "./pages/Plans";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import NotFound from "./pages/NotFound";

const App = () => (
  <TRPCProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/documents/upload" element={<DocumentUpload />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/tenants" element={<TenantManagement />} />
          <Route path="/planos" element={<Plans />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </TRPCProvider>
);

export default App;
