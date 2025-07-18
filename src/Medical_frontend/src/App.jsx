import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './views/doctor/components/sidebar';
import Header from './views/doctor/components/header';
import Dashboard from './views/doctor/dashboard/dashboard';
import Patients from './views/doctor/patients/patients';

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
