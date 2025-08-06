import React, { useState, useEffect } from 'react';
import { Users, Activity, FileText, Calendar, Building2, ChevronRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { getPrincipal, getActor, isAuthenticated } from '../../../service/auth';

const Adashboard = () => {
  const [currentView, setCurrentView] = useState('hospitals');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);

  // Initialize auth data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isAuth = await isAuthenticated();
        if (isAuth) {
          const currentPrincipal = getPrincipal();
          const currentActor = getActor();
          setPrincipal(currentPrincipal);
          setActor(currentActor);
        } else {
          setPrincipal(null);
          setActor(null);
        }
      } catch (err) {
        setError('Failed to initialize authentication: ' + err.message);
      }
    };
    initializeAuth();
    const authInterval = setInterval(initializeAuth, 5000);
    return () => clearInterval(authInterval);
  }, []);

  // Fetch hospitals from canister
  const fetchHospitals = async () => {
    try {
      if (!actor) return;
      setLoading(true);
      const result = await actor.getHospitals();
      setHospitals(result || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch hospitals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors from canister
  const fetchDoctors = async () => {
    try {
      if (!actor) return;
      const result = await actor.getDoctors();
      setDoctors(result || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  // Fetch medical records for a specific patient
  const fetchMedicalRecords = async (patientId) => {
    try {
      if (!actor) return [];
      const result = await actor.getMedicalRecordsByPatient(patientId);
      return result || [];
    } catch (err) {
      return [];
    }
  };

  // Get available doctors for specific day and hospital
  const fetchAvailableDoctors = async (hospitalId, dayOfWeek) => {
    try {
      if (!actor) return [];
      const result = await actor.getAvailableDoctors(hospitalId, dayOfWeek);
      return result || [];
    } catch (err) {
      return [];
    }
  };

  // Get doctor patients count
  const fetchDoctorPatientsCount = async (doctorId) => {
    try {
      if (!actor) return 0;
      const result = await actor.getDoctorPatientsCount(doctorId);
      return Number(result) || 0;
    } catch (err) {
      return 0;
    }
  };

  // Check if user has access to hospital
  const checkHospitalAccess = (hospital) => {
    if (!principal || !hospital) return false;
    const hospitalWallet = hospital.walletAddress?.toText ? 
      hospital.walletAddress.toText() : 
      hospital.walletAddress?.toString();
    return hospitalWallet === principal;
  };

  // Initialize and fetch data when auth is ready
  useEffect(() => {
    const initialize = async () => {
      if (!principal || !actor) {
        setError(null);
        setLoading(false);
        return;
      }
      try {
        await fetchHospitals();
        await fetchDoctors();
      } catch (err) {
        setError('Failed to initialize dashboard: ' + err.message);
      }
    };
    initialize();
  }, [principal, actor]);

  // Real-time data updates
  useEffect(() => {
    if (hospitals.length > 0 && principal && actor) {
      const interval = setInterval(async () => {
        try {
          await fetchHospitals();
          await fetchDoctors();
          setLastUpdate(new Date());
        } catch (err) {
          console.error('Failed to refresh data:', err);
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [hospitals.length, principal, actor]);

  // Calculate hospital statistics
  const getHospitalStats = async (hospitalId) => {
    try {
      const hospitalDoctors = doctors.filter(d => Number(d.hospitalId) === Number(hospitalId));
      const activeDoctors = hospitalDoctors.filter(d => d.isActive);
      let totalPatients = 0;
      for (const doctor of hospitalDoctors) {
        const count = await fetchDoctorPatientsCount(Number(doctor.id));
        totalPatients += count;
      }
      const today = new Date().getDay();
      const availableToday = await fetchAvailableDoctors(hospitalId, today);
      return {
        totalDoctors: hospitalDoctors.length,
        activeDoctors: activeDoctors.length,
        totalPatients: totalPatients,
        todayAppointments: availableToday.length * 8
      };
    } catch (err) {
      return {
        totalDoctors: 0,
        activeDoctors: 0,
        totalPatients: 0,
        todayAppointments: 0
      };
    }
  };

  // Handle hospital selection
  const handleHospitalSelect = async (hospital) => {
    if (!checkHospitalAccess(hospital)) {
      setError('Access denied. You are not registered for this hospital.');
      return;
    }
    setLoading(true);
    setSelectedHospital(hospital);
    try {
      const stats = await getHospitalStats(Number(hospital.id));
      setSelectedHospital(prev => ({ ...prev, stats }));
      const allRecords = [];
      for (let patientId = 1; patientId <= 5; patientId++) {
        const records = await fetchMedicalRecords(patientId);
        allRecords.push(...records);
      }
      const sortedRecords = allRecords.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
      setMedicalRecords(sortedRecords.slice(0, 10));
      setCurrentView('dashboard');
      setError(null);
    } catch (err) {
      setError('Failed to load hospital data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data manually
  const refreshData = async () => {
    if (!actor) {
      setError('System not ready. Please try again.');
      return;
    }
    setLoading(true);
    try {
      await fetchHospitals();
      await fetchDoctors();
      if (selectedHospital) {
        const stats = await getHospitalStats(Number(selectedHospital.id));
        setSelectedHospital(prev => ({ ...prev, stats }));
      }
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to refresh data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    try {
      const date = new Date(Number(timestamp) / 1000000);
      return date.toLocaleString();
    } catch (err) {
      return 'Unknown time';
    }
  };

  // Hospital Logo component - always use registered logo URL
  const HospitalLogo = ({ logoURL, hospitalName, size = 'default' }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    // Size variants
    const sizeClasses = {
      small: 'w-8 h-8',
      default: 'w-12 h-12',
      large: 'w-16 h-16'
    };

    const iconSizes = {
      small: 'w-4 h-4',
      default: 'w-6 h-6',
      large: 'w-8 h-8'
    };

    // Reset states when logoURL changes
    useEffect(() => {
      if (logoURL) {
        setImageError(false);
        setImageLoaded(false);
      }
    }, [logoURL]);

    // Only show fallback icon if no logoURL provided or image failed to load
    if (!logoURL || imageError) {
      return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm`}>
          <Building2 className={`${iconSizes[size]} text-white`} />
        </div>
      );
    }

    return (
      <div className={`${sizeClasses[size]} rounded-lg overflow-hidden shadow-sm bg-white border border-gray-100 relative`}>
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <Building2 className={`${iconSizes[size]} text-gray-400`} />
          </div>
        )}
        {/* Actual logo image */}
        <img
          src={logoURL}
          alt={`${hospitalName} logo`}
          className={`w-full h-full object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={() => {
            console.log(`Failed to load logo for ${hospitalName}: ${logoURL}`);
            setImageError(true);
          }}
          onLoad={() => {
            console.log(`Successfully loaded logo for ${hospitalName}: ${logoURL}`);
            setImageLoaded(true);
          }}
          style={{ backgroundColor: 'white' }}
        />
      </div>
    );
  };

  // No authenticated user
  if (!principal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to login with Internet Identity to access the medical dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Actor not available
  if (!actor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">System Loading</h2>
          <p className="text-gray-600 mb-4">Please wait while we connect to the blockchain...</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Hospitals List View
  const HospitalsView = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Medical Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Select a hospital to access your dashboard</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500">
              Connected as: <span className="font-medium">{principal?.slice(0, 8)}...{principal?.slice(-6)}</span>
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">Last update: {lastUpdate.toLocaleTimeString()}</span>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && hospitals.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Loading hospitals...</p>
          </div>
        )}

        {/* Hospitals Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.filter(hospital => hospital.isActive).map((hospital) => {
            const hasAccess = checkHospitalAccess(hospital);
            const hospitalDoctors = doctors.filter(d => Number(d.hospitalId) === Number(hospital.id));
            const activeDoctors = hospitalDoctors.filter(d => d.isActive);

            return (
              <div
                key={Number(hospital.id)}
                className={`bg-white rounded-xl p-6 border-2 transition-all duration-200 ${
                  hasAccess 
                    ? 'border-transparent hover:border-blue-200 cursor-pointer hover:shadow-lg hover:-translate-y-1' 
                    : 'border-gray-100 opacity-60 cursor-not-allowed'
                }`}
                onClick={() => hasAccess && handleHospitalSelect(hospital)}
              >
                <div className="flex items-start space-x-4">
                  <HospitalLogo logoURL={hospital.logoURL} hospitalName={hospital.name} size="default" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">{hospital.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{hospitalDoctors.length} doctors</span>
                      </div>
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        <span>{activeDoctors.length} active</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mb-3 truncate">
                      Wallet: {hospital.walletAddress?.toText ? 
                        hospital.walletAddress.toText().slice(0, 8) + '...' + hospital.walletAddress.toText().slice(-6) :
                        hospital.walletAddress?.toString().slice(0, 8) + '...' + hospital.walletAddress?.toString().slice(-6)
                      }
                    </div>
                  </div>
                  {hasAccess && <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm font-medium text-gray-600">
                        {hasAccess ? 'Access Granted' : 'Access Denied'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">ID: {Number(hospital.id)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {!loading && hospitals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hospitals Found</h3>
            <p className="text-gray-600 mb-4">No hospitals are currently registered in the system.</p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Hospital Dashboard View
const DashboardView = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('hospitals')}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Hospitals</span>
            </button>
            <HospitalLogo logoURL={selectedHospital?.logoURL} hospitalName={selectedHospital?.name} size="default" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{selectedHospital?.name}</h1>
              <p className="text-xs text-gray-500">Hospital Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-gray-500">Last update: {lastUpdate.toLocaleTimeString()}</span>
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-transparent hover:border-gray-200 shadow-sm transition">
            <div className="flex justify-between items-center text-gray-500 text-xs font-medium">
              <span>Total Doctors</span>
              <span className="cursor-pointer">⋯</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-gray-900">
              {selectedHospital?.stats?.totalDoctors || 0}
            </div>
            <div className="mt-1 text-xs text-gray-500">All registered</div>
            <div className="mt-2 inline-flex items-center text-blue-600 text-xs font-semibold rounded-md bg-blue-100 px-2 py-0.5">
              <Users className="w-3 h-3 mr-1" />
              <span>Doctors</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-transparent hover:border-gray-200 shadow-sm transition">
            <div className="flex justify-between items-center text-gray-500 text-xs font-medium">
              <span>Active Doctors</span>
              <span className="cursor-pointer">⋯</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-gray-900">
              {selectedHospital?.stats?.activeDoctors || 0}
            </div>
            <div className="mt-1 text-xs text-gray-500">Currently available</div>
            <div className="mt-2 inline-flex items-center text-green-600 text-xs font-semibold rounded-md bg-green-100 px-2 py-0.5">
              <Activity className="w-3 h-3 mr-1" />
              <span>Active</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-transparent hover:border-gray-200 shadow-sm transition">
            <div className="flex justify-between items-center text-gray-500 text-xs font-medium">
              <span>Total Patients</span>
              <span className="cursor-pointer">⋯</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-gray-900">
              {selectedHospital?.stats?.totalPatients || 0}
            </div>
            <div className="mt-1 text-xs text-gray-500">All records</div>
            <div className="mt-2 inline-flex items-center text-purple-600 text-xs font-semibold rounded-md bg-purple-100 px-2 py-0.5">
              <FileText className="w-3 h-3 mr-1" />
              <span>Patients</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-transparent hover:border-gray-200 shadow-sm transition">
            <div className="flex justify-between items-center text-gray-500 text-xs font-medium">
              <span>Today's Capacity</span>
              <span className="cursor-pointer">⋯</span>
            </div>
            <div className="mt-2 font-bold text-2xl text-gray-900">
              {selectedHospital?.stats?.todayAppointments || 0}
            </div>
            <div className="mt-1 text-xs text-gray-500">Estimated slots</div>
            <div className="mt-2 inline-flex items-center text-orange-600 text-xs font-semibold rounded-md bg-orange-100 px-2 py-0.5">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Appointments</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Medical Records */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-5 border border-transparent hover:border-gray-200 shadow-sm transition">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Recent Medical Records</h3>
                <button className="text-xs text-blue-600 hover:text-blue-800">View All</button>
              </div>
              {loading && (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="text-gray-600 text-sm">Loading medical records...</p>
                </div>
              )}
              {!loading && medicalRecords.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No medical records found</p>
                </div>
              )}
              <div className="space-y-3">
                {medicalRecords.map((record) => {
                  const doctor = doctors.find(d => Number(d.id) === Number(record.doctorId));
                  return (
                    <div
                      key={Number(record.id)}
                      className="flex items-center justify-between bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {Number(record.patientId).toString().slice(-2).padStart(2, '0')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Patient ID: {Number(record.patientId)}</p>
                          <p className="text-xs text-gray-500">
                            {doctor?.name || 'Unknown Doctor'} • {record.diagnosis}
                          </p>
                          <p className="text-xs text-gray-400">
                            {record.prescriptions.length} prescriptions • {formatTime(record.createdAt)}
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <FileText className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Section - Doctors */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 border border-transparent hover:border-gray-200 shadow-sm transition">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-800">Doctors</h3>
                <span className="text-gray-400 text-xs cursor-pointer">⋯</span>
              </div>
              <div className="space-y-3">
                {doctors
                  .filter(d => Number(d.hospitalId) === Number(selectedHospital?.id))
                  .map((doctor) => (
                    <div key={Number(doctor.id)} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {doctor.photoURL ? (
                          <img
                            src={doctor.photoURL}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className="text-gray-600 text-sm" style={{display: doctor.photoURL ? 'none' : 'block'}}>
                          {doctor.name?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{doctor.name}</p>
                        <p className="text-xs text-gray-400">{doctor.specialty || 'General Practice'}</p>
                      </div>
                      <div className={`text-xs font-semibold rounded-md px-2 py-0.5 ${
                        doctor.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                      }`}>
                        {doctor.isActive ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {currentView === 'hospitals' ? <HospitalsView /> : <DashboardView />}
    </div>
  );
};

export default Adashboard;