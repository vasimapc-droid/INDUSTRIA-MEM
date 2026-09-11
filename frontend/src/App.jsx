import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Machines from './pages/Machines';
import MachineDetails from './pages/MachineDetails';
import Incidents from './pages/Incidents';
import CreateIncident from './pages/CreateIncident';
import IncidentDetails from './pages/IncidentDetails';
import KnowledgeBase from './pages/KnowledgeBase';
import KnowledgeDetails from './pages/KnowledgeDetails';
import VoiceCapture from './pages/VoiceCapture';
import AskAI from './pages/AskAI';
import AskExpert from './pages/AskExpert';
import ExpertFinder from './pages/ExpertFinder';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PendingVerification from './pages/PendingVerification';
import AdminManage from './pages/AdminManage';
import ExpertRequests from './pages/ExpertRequests';
import MyRequests from './pages/MyRequests';
import MyBookmarks from './pages/MyBookmarks';
import ExpertProfile from './pages/ExpertProfile';

function Protected({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboard />;
  if (user?.role === 'EXPERT')     return <ExpertDashboard />;
  if (user?.role === 'ADMIN')      return <AdminDashboard />;
  return <Dashboard />;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<RoleDashboard />} />
        <Route path="machines" element={<Machines />} />
        <Route path="machines/:id" element={<MachineDetails />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="incidents/new" element={<CreateIncident />} />
        <Route path="incidents/:id" element={<IncidentDetails />} />
        <Route path="knowledge" element={<KnowledgeBase />} />
        <Route path="knowledge/:id" element={<KnowledgeDetails />} />
        <Route path="voice-capture" element={<VoiceCapture />} />
        <Route path="ask-ai" element={<AskAI />} />
        <Route path="ask-expert" element={<AskExpert />} />
        <Route path="expert-finder" element={<ExpertFinder />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="reports" element={<Reports />} />
        <Route path="expert-requests" element={
          <Protected roles={['EXPERT','ADMIN']}><ExpertRequests /></Protected>
        } />
        <Route path="my-requests" element={<MyRequests />} />
        <Route path="my-bookmarks" element={<MyBookmarks />} />
        <Route path="admin" element={
          <Protected roles={['ADMIN']}><AdminManage /></Protected>
        } />
        <Route path="pending-verification" element={
          <Protected roles={['EXPERT','ADMIN']}><PendingVerification /></Protected>
        } />
        <Route path="expert-profile" element={<Protected roles={['EXPERT','ADMIN']}><ExpertProfile /></Protected>} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}