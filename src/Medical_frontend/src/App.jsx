import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './views/public/landingPage/page';
import DoctorLayout from './views/doctor/docLayout';
import Dashboard from './views/doctor/dashboard/dashboard';
import Patients from './views/doctor/patients/patients';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route untuk Landing Page (tanpa Sidebar/Header) */}
        <Route path="/" element={<LandingPage />} />

        {/* Grup Route untuk Dokter (semua akan punya Sidebar/Header) */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
        </Route>
        
        {/* Anda bisa menambahkan route lain di sini, misal untuk login */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
