import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}