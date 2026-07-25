import { Navigate, useLocation } from 'react-router-dom';
import { getSession } from '../services/authService';
export default function ProtectedRoute({children}) { const location=useLocation(); return getSession()?children:<Navigate to="/login" replace state={{from:location.pathname}}/>; }
