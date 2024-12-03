import './App.css';
import Login from "./components/login";
import Home from "./components/home";
import Register from "./components/register";
import TPersonal from "./components/TPersonal";
import Edit from "./components/Edit";
import Pago from "./components/Pagos";
import Subir from "./components/Subir";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";

const stripePromise = loadStripe('pk_test_51QOxDnAgPTFOWwmwNoixuUt5yFvmPUAuwGpAqAVsJ24hpzYE48IA6bEFviJvJl0IFghUrMsNKgE8aU2Ia6Ha39FY00UN0HKjwE');

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/tpersonal" element={<ProtectedRoute><TPersonal /></ProtectedRoute>} />
          <Route path="/edit" element={<ProtectedRoute><Edit /></ProtectedRoute>} />
          <Route path="/subir" element={<ProtectedRoute><Subir /></ProtectedRoute>} />
          <Route path="/pagos" element={
            <ProtectedRoute>
              <Elements stripe={stripePromise}>
                <Pago />
              </Elements>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Login />} /> {/* Redirige a login si no hay ruta */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
