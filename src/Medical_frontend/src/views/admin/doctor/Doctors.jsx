import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { 
  initializeAuth, 
  loginInternetIdentity, 
  getActor, 
  getPrincipal, 
  isAuthenticated,
  logout 
} from '../../../service/auth';
import { Principal } from '@dfinity/principal'; // Import Principal

// DoctorsList Component
const DoctorsList = ({ 
  doctors, 
  hospitals, 
  onAddDoctor, 
  onToggleDoctorStatus, 
  isLoading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => Number(h.id) === Number(hospitalId));
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = !filterHospital || Number(doctor.hospitalId) === Number(filterHospital);
    const matchesStatus = !filterStatus || doctor.isActive.toString() === filterStatus;
    
    return matchesSearch && matchesHospital && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A2F2EF]"></div>
          <span className="ml-3 text-gray-600">Loading doctors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600 mt-1">Manage doctors and their information</p>
        </div>
        <button
          onClick={onAddDoctor}
          className="bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Doctor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent"
            />
          </div>
          
          <select
            value={filterHospital}
            onChange={(e) => setFilterHospital(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent"
          >
            <option value="">All Hospitals</option>
            {hospitals.map(hospital => (
              <option key={Number(hospital.id)} value={Number(hospital.id)}>{hospital.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredDoctors.length} doctors
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <div key={Number(doctor.id)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {doctor.photoURL ? (
                    <img 
                      src={doctor.photoURL} 
                      alt={doctor.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                </div>
              </div>
              <button
                onClick={() => onToggleDoctorStatus(Number(doctor.id))}
                className={`p-1 rounded-full ${doctor.isActive ? 'text-green-600' : 'text-red-600'}`}
              >
                {doctor.isActive ? (
                  <CheckCircleIcon className="w-5 h-5" />
                ) : (
                  <XCircleIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <BuildingOfficeIcon className="w-4 h-4" />
                <span>{getHospitalName(doctor.hospitalId)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  doctor.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {doctor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="text-xs text-gray-500 font-mono">
                {doctor.walletAddress.toString().slice(0, 20)}...
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

// AddDoctor Component
const AddDoctor = ({ 
  onBack, 
  onSave, 
  hospitals, 
  userHospitals, 
  isSubmitting, 
  errors: submitErrors,
  isAuthenticated,
  currentPrincipal
}) => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    hospitalId: null,
    photoURL: '',
    walletAddress: ''
  });
  const [errors, setErrors] = useState({});

  const specialties = [
    'Cardiologist', 'Neurologist', 'Pediatrician', 'Dermatologist', 
    'Orthopedist', 'Gynecologist', 'Psychiatrist', 'Radiologist',
    'Anesthesiologist', 'Pathologist', 'Surgeon', 'Internal Medicine'
  ];

  useEffect(() => {
    console.log('userHospitals:', userHospitals);
  }, [userHospitals]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Doctor name is required';
    }

    if (!formData.specialty) {
      newErrors.specialty = 'Specialty is required';
    }

    if (formData.hospitalId === null || formData.hospitalId === undefined) {
      newErrors.hospitalId = 'Hospital is required';
    }

    if (!formData.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    } else {
      try {
        Principal.fromText(formData.walletAddress); // Validate Principal format
        const principalRegex = /^[a-z0-9\-]{10,63}$/;
        if (!principalRegex.test(formData.walletAddress)) {
          newErrors.walletAddress = 'Invalid principal ID format';
        }
      } catch (error) {
        newErrors.walletAddress = 'Invalid principal ID';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSave({
      hospitalId: formData.hospitalId,
      name: formData.name,
      specialty: formData.specialty,
      photoURL: formData.photoURL,
      walletAddress: formData.walletAddress
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-8">
            Please login via Internet Identity to register doctors to the blockchain.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back to Doctors List
          </button>
        </div>
      </div>
    );
  }

  if (userHospitals.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-[#A2F2EF] hover:text-[#8EEAE7] font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Doctors
          </button>
        </div>
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Hospital Access</h2>
          <p className="text-gray-600 mb-8">
            You need to register a hospital first before you can add doctors.
            Only hospital owners can add doctors to their hospitals.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Current wallet: {currentPrincipal}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-[#A2F2EF] hover:text-[#8EEAE7] font-medium mb-4 flex items-center gap-2"
        >
          ← Back to Doctors
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Doctor</h1>
        <p className="text-gray-600 mt-1">Register a new doctor to the blockchain</p>
        <div className="text-sm text-blue-600 mt-2">
          Logged in as: {currentPrincipal}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Name * <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter doctor's full name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty * <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
              </label>
              <select
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent ${
                  errors.specialty ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select specialty</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              {errors.specialty && <p className="mt-1 text-sm text-red-600">{errors.specialty}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital * <span className="text-xs text-blue-600">(only your hospitals)</span>
              </label>
              <select
                value={formData.hospitalId ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Selected hospital:', value);
                  handleInputChange('hospitalId', value ? Number(value) : null);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent z-10 ${
                  errors.hospitalId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select hospital</option>
                {userHospitals.map(hospital => (
                  <option key={Number(hospital.id)} value={Number(hospital.id)}>
                    {hospital.name || 'Unnamed Hospital'}
                  </option>
                ))}
              </select>
              {errors.hospitalId && <p className="mt-1 text-sm text-red-600">{errors.hospitalId}</p>}
              <p className="text-xs text-gray-500 mt-1">
                You can only add doctors to hospitals you own
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor's Principal ID * <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => handleInputChange('walletAddress', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent ${
                  errors.walletAddress ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., eiwou-zsal6-3cl6a-q6bnh-wtuba-zlecp-3higz-x4yzm-rxfdr-pgk7r-uqe"
              />
              {errors.walletAddress && <p className="mt-1 text-sm text-red-600">{errors.walletAddress}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Enter the doctor's Internet Identity Principal ID
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo URL (Optional) <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
            </label>
            <input
              type="url"
              value={formData.photoURL}
              onChange={(e) => handleInputChange('photoURL', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {formData.photoURL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo Preview
              </label>
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={formData.photoURL}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {submitErrors && <p className="text-red-500 text-sm">{submitErrors}</p>}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2 inline-block"></div>
                  Registering to Blockchain...
                </>
              ) : (
                'Register Doctor'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Doctors Component
const Doctors = () => {
  const [currentView, setCurrentView] = useState('list');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [actor, setActor] = useState(null);
  const [actorError, setActorError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [userHospitals, setUserHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    initializeAuthAndData();
    window.addEventListener('reloadHospitals', initializeAuthAndData);
    return () => window.removeEventListener('reloadHospitals', initializeAuthAndData);
  }, []);

  const initializeAuthAndData = async () => {
    try {
      setIsLoading(true);
      const authStatus = await initializeAuth();
      if (authStatus) {
        const currentPrincipal = getPrincipal();
        const currentActor = getActor();
        
        if (currentPrincipal && currentActor) {
          console.log('Initialized principal:', currentPrincipal);
          setPrincipal(currentPrincipal);
          setActor(currentActor);
          setIsAuthenticated(true);
          await loadData(currentActor, currentPrincipal);
        } else {
          console.warn('No principal or actor found after auth initialization');
        }
      } else {
        console.log('No active session found');
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setActorError('Failed to initialize authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async (currentActor = actor, currentPrincipal = principal) => {
    if (!currentActor) {
      console.warn('No actor available for data loading');
      return;
    }
    
    try {
      const [doctorsResult, hospitalsResult] = await Promise.all([
        currentActor.getDoctors(),
        currentActor.getHospitals()
      ]);
      
      const normalizedHospitals = hospitalsResult.map(hospital => ({
        ...hospital,
        id: Number(hospital.id)
      }));
      
      console.log('All hospitals:', normalizedHospitals);
      console.log('Current principal:', currentPrincipal);
      const ownedHospitals = normalizedHospitals.filter(hospital => {
        const isOwner = hospital.walletAddress.toString().toLowerCase() === currentPrincipal?.toLowerCase();
        console.log(
          `Hospital ${hospital.name}: walletAddress=${hospital.walletAddress.toString()}, isOwner=${isOwner}`
        );
        return isOwner;
      });
      console.log('Owned hospitals:', ownedHospitals);
      
      const normalizedDoctors = doctorsResult.map(doctor => ({
        ...doctor,
        id: Number(doctor.id),
        hospitalId: Number(doctor.hospitalId)
      }));
      
      setDoctors(normalizedDoctors);
      setHospitals(normalizedHospitals);
      setUserHospitals(ownedHospitals);
    } catch (error) {
      console.error('Failed to load data:', error);
      setActorError('Failed to load data from blockchain. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setActorError(null);
      
      const identity = await loginInternetIdentity();
      const currentPrincipal = getPrincipal();
      const currentActor = getActor();
      
      if (currentPrincipal && currentActor) {
        console.log('Logged in principal:', currentPrincipal);
        setPrincipal(currentPrincipal);
        setActor(currentActor);
        setIsAuthenticated(true);
        await loadData(currentActor, currentPrincipal);
      } else {
        throw new Error('Failed to retrieve principal or actor after login');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setActorError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setPrincipal(null);
      setActor(null);
      setIsAuthenticated(false);
      setDoctors([]);
      setHospitals([]);
      setUserHospitals([]);
      setCurrentView('list');
    } catch (error) {
      console.error('Logout failed:', error);
      setActorError('Logout failed. Please try again.');
    }
  };

  const handleAddDoctor = () => {
    if (!isAuthenticated) {
      handleLogin();
      return;
    }
    setCurrentView('add');
    setSubmitError('');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSubmitError('');
  };

  const handleSaveDoctor = async (doctorData) => {
    if (!actor) {
      setSubmitError('Blockchain connection not initialized. Please try logging in again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const doctorPrincipal = Principal.fromText(doctorData.walletAddress); // Convert string to Principal
      const result = await actor.registerDoctor(
        Number(doctorData.hospitalId),
        doctorData.name,
        doctorData.specialty,
        doctorData.photoURL,
        doctorPrincipal
      );
      
      console.log('Doctor registration result:', result);
      
      if (result.includes('Unauthorized')) {
        setSubmitError(result);
      } else {
        await loadData();
        setCurrentView('list');
        alert('Doctor registered successfully!');
      }
    } catch (error) {
      console.error('Doctor registration failed:', error);
      setSubmitError(`Registration failed: ${error.message || 'Invalid principal ID or other error. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleDoctorStatus = async (doctorId) => {
    if (!actor) {
      setActorError('No actor available. Please try logging in again.');
      return;
    }

    try {
      const result = await actor.deactivateDoctor(Number(doctorId));
      console.log('Doctor status toggle result:', result);
      
      if (result.includes('Unauthorized')) {
        setActorError(result);
      } else {
        await loadData();
      }
    } catch (error) {
      console.error('Failed to toggle doctor status:', error);
      setActorError('Failed to update doctor status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {actorError && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex justify-between items-center">
            <p className="text-red-800 font-medium">{actorError}</p>
            <button
              onClick={() => setActorError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {!isAuthenticated && currentView === 'list' && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-800 font-medium">
                Connect your wallet to manage doctors
              </p>
              <p className="text-blue-600 text-sm">
                Login with Internet Identity to register and manage doctors on the blockchain
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Login
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-800 font-medium">
                Connected as: {principal?.slice(0, 10)}...{principal?.slice(-8)}
              </p>
              <p className="text-green-600 text-sm">
                You can manage {userHospitals.length} hospital(s)
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-green-600 text-green-700 rounded-lg hover:bg-green-100 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {currentView === 'list' ? (
        <DoctorsList 
          doctors={doctors}
          hospitals={hospitals}
          onAddDoctor={handleAddDoctor}
          onToggleDoctorStatus={handleToggleDoctorStatus}
          isLoading={isLoading}
        />
      ) : (
        <AddDoctor 
          onBack={handleBack}
          onSave={handleSaveDoctor}
          hospitals={hospitals}
          userHospitals={userHospitals}
          isSubmitting={isSubmitting}
          errors={submitError}
          isAuthenticated={isAuthenticated}
          currentPrincipal={principal}
        />
      )}
    </div>
  );
};

export default Doctors;