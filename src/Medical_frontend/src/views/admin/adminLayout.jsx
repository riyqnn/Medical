import { Outlet } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Header from './components/header';

function AdminLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {/* Halaman seperti Dashboard & Patients akan muncul di sini */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;