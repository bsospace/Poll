import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./hooks/UseAuth";
import { AppRoutes } from "./routes/Index";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
