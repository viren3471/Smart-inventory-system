import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 bg-radial-glow">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen">
        <div className="p-4 pt-16 lg:p-10 lg:pt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
