import { BrowserRouter, Routes, Route } from "react-router-dom";
import CitizenFeed from "./pages/CitizenFeed";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashBoard";
import IncidentForm from "./components/IncidentForm";
import ProtectedRoute from "./components/ProtectedRoute";
import WorkerLogin from "./pages/WorkerLogin";
import WorkerDashboard from "./pages/WorkerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CitizenFeed />} />
        <Route path="/report" element={<IncidentForm />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/worker/login" element={<WorkerLogin />} />
        <Route path="/worker" element={<WorkerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
