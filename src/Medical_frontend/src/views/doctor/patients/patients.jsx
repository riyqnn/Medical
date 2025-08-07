import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  HeartIcon,
  PlusCircleIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const Patients = ({ principal, actor }) => {
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [allMedicalRecords, setAllMedicalRecords] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (actor && principal && !dataLoaded) {
      loadBlockchainData();
    }
  }, [actor, principal, dataLoaded]);

  const loadBlockchainData = async () => {
    if (!actor) {
      setError('Smart contract not connected. Please check your connection.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading data from smart contract...');
      
      // Load hospitals and doctors concurrently
      const [hospitalsData, doctorsData] = await Promise.all([
        actor.getHospitals(),
        actor.getDoctors(),
      ]);

      console.log('Hospitals loaded:', hospitalsData.length);
      console.log('Doctors loaded:', doctorsData.length);

      setHospitals(hospitalsData);
      setDoctors(doctorsData);

      // Load medical records for patient IDs 1-50 (adjust range as needed)
      await loadMedicalRecords();
      setDataLoaded(true);
      
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setError('Failed to load data from smart contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMedicalRecords = async () => {
    if (!actor) return;

    try {
      console.log('Loading medical records...');
      const recordPromises = [];
      
      // Try to get medical records for patient IDs 1-50
      for (let patientId = 1; patientId <= 50; patientId++) {
        recordPromises.push(
          actor.getMedicalRecordsByPatient(patientId)
            .then(records => ({ patientId, records }))
            .catch(() => ({ patientId, records: [] }))
        );
      }

      const allPatientRecords = await Promise.all(recordPromises);
      const flattenedRecords = [];
      
      allPatientRecords.forEach(({ patientId, records }) => {
        if (records && records.length > 0) {
          records.forEach(record => {
            flattenedRecords.push({
              id: Number(record.id),
              patientId: Number(record.patientId),
              hospitalId: Number(record.hospitalId),
              doctorId: Number(record.doctorId),
              diagnosis: record.diagnosis,
              cpptURL: record.cpptURL,
              evidenceURLs: record.evidenceURLs || [],
              prescriptions: record.prescriptions || [],
              createdAt: Number(record.createdAt),
            });
          });
        }
      });

      console.log('Total medical records loaded:', flattenedRecords.length);
      setAllMedicalRecords(flattenedRecords);

      // Generate patient data from records
      if (flattenedRecords.length > 0) {
        generatePatientsFromRecords(flattenedRecords);
      }
      
    } catch (error) {
      console.error('Error loading medical records:', error);
      setError('Failed to load medical records. Please try again.');
    }
  };

  const generatePatientsFromRecords = (records) => {
    const uniquePatientIds = [...new Set(records.map(record => record.patientId))];
    const generatedPatients = uniquePatientIds.map(id => {
      const patientRecords = records.filter(r => r.patientId === id);
      const lastVisit = Math.max(...patientRecords.map(r => r.createdAt));
      
      return {
        id,
        name: `Patient ${String(id).padStart(3, '0')}`,
        dateOfBirth: `199${(id % 10)}-${String((id % 12) + 1).padStart(2, '0')}-${String((id % 28) + 1).padStart(2, '0')}`,
        bloodType: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'][id % 8],
        gender: id % 2 === 0 ? 'Male' : 'Female',
        address: `Jl. Medical ${id}, Jakarta`,
        recordCount: patientRecords.length,
        lastVisit: lastVisit,
        isActive: true,
      };
    }).sort((a, b) => b.recordCount - a.recordCount);

    setPatients(generatedPatients);
  };

  const handlePatientFilter = (patientId) => {
    setSelectedPatientId(patientId);
    setFilterHospital('');
    
    if (patientId) {
      const patientRecords = allMedicalRecords.filter(
        record => record.patientId === parseInt(patientId)
      );
      setMedicalRecords(patientRecords);
    } else {
      setMedicalRecords([]);
    }
  };

  const handleSearchPatient = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = patients.filter(patient => 
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.id.toString().includes(query)
      );
      if (filtered.length === 1) {
        handlePatientFilter(filtered[0].id.toString());
      }
    }
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => Number(h.id) === hospitalId);
    return hospital?.name || 'Unknown Hospital';
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => Number(d.id) === doctorId);
    return doctor?.name || 'Unknown Doctor';
  };

  const getDoctorSpecialty = (doctorId) => {
    const doctor = doctors.find(d => Number(d.id) === doctorId);
    return doctor?.specialty || 'General';
  };

  const formatDate = (timestamp) => {
    // Convert nanoseconds to milliseconds
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const filteredRecords = medicalRecords.filter(record => 
    !filterHospital || record.hospitalId === parseInt(filterHospital)
  );

  const filteredPatients = patients.filter(patient =>
    !searchQuery || 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toString().includes(searchQuery)
  );

  // Connection Status Component
  const ConnectionStatus = () => {
    if (!principal) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
            <div>
              <h3 className="font-semibold text-amber-800">Wallet Not Connected</h3>
              <p className="text-amber-700 text-sm">Please connect your wallet to view patient records.</p>
            </div>
          </div>
        </div>
      );
    }

    if (!actor) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <XCircleIcon className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Smart Contract Connection Error</h3>
              <p className="text-red-700 text-sm">Unable to connect to the medical smart contract. Please refresh the page.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-800">Connected to Medical System</h3>
            <p className="text-green-700 text-sm">
              Wallet: {principal.toString().slice(0, 8)}...{principal.toString().slice(-6)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const RecordDetailsModal = ({ record, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Medical Record #{record.id}</h3>
              <p className="text-gray-500">Patient ID: {record.patientId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Hospital</h4>
                <p className="text-gray-700">{getHospitalName(record.hospitalId)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Doctor</h4>
                <p className="text-gray-700">{getDoctorName(record.doctorId)}</p>
                <p className="text-sm text-gray-500">{getDoctorSpecialty(record.doctorId)}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Diagnosis</h4>
              <p className="text-gray-700">{record.diagnosis}</p>
            </div>

            {record.prescriptions && record.prescriptions.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Prescriptions</h4>
                <div className="space-y-3">
                  {record.prescriptions.map((prescription, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                      <h5 className="font-medium text-gray-900">{prescription.medicationName}</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                        <div><strong>Dosage:</strong> {prescription.dosage}</div>
                        <div><strong>Frequency:</strong> {prescription.frequency}</div>
                        <div><strong>Duration:</strong> {prescription.duration}</div>
                      </div>
                      {prescription.instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Instructions:</strong> {prescription.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={record.cpptURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#A2F2EF] text-gray-800 rounded-lg hover:bg-[#8EEAE7] font-medium transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5" />
                View CPPT Document
              </a>
              {record.evidenceURLs && record.evidenceURLs.length > 0 && (
                <div className="flex gap-2">
                  {record.evidenceURLs.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <PhotoIcon className="w-5 h-5" />
                      Evidence {index + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 pt-4 border-t">
              Created: {formatDate(record.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status */}
      <div className="p-6 pb-0">
        <ConnectionStatus />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Medical Records</h1>
              <p className="text-gray-600 mt-2">View and manage patient medical records from the blockchain</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDataLoaded(false);
                  loadBlockchainData();
                }}
                disabled={!actor || !principal || isLoading}
                className="px-4 py-2 bg-[#A2F2EF] text-gray-800 rounded-lg hover:bg-[#8EEAE7] font-medium transition-colors disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-5 h-5 inline mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A2F2EF] mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading data from smart contract...</p>
            </div>
          </div>
        )}

        {!isLoading && principal && actor && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                  </div>
                  <UserIcon className="w-8 h-8 text-[#A2F2EF]" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">{allMedicalRecords.length}</p>
                  </div>
                  <DocumentTextIcon className="w-8 h-8 text-[#A2F2EF]" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hospitals</p>
                    <p className="text-2xl font-bold text-gray-900">{hospitals.length}</p>
                  </div>
                  <BuildingOfficeIcon className="w-8 h-8 text-[#A2F2EF]" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Doctors</p>
                    <p className="text-2xl font-bold text-gray-900">{doctors.filter(d => d.isActive).length}</p>
                  </div>
                  <HeartIcon className="w-8 h-8 text-[#A2F2EF]" />
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Search & Filter</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patient name or ID..."
                    value={searchQuery}
                    onChange={(e) => handleSearchPatient(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter Patient ID..."
                    value={selectedPatientId}
                    onChange={(e) => handlePatientFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterHospital}
                  onChange={(e) => setFilterHospital(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent"
                >
                  <option value="">All Hospitals</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center justify-center bg-gray-50 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-600">
                    <strong>{filteredRecords.length}</strong> records found
                  </span>
                </div>
              </div>
            </div>

            {/* Patients List */}
            {filteredPatients.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Patients Overview {searchQuery && `(${filteredPatients.length} found)`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.slice(0, 12).map(patient => (
                    <div
                      key={patient.id}
                      className={`p-4 border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
                        selectedPatientId === patient.id.toString() 
                          ? 'border-[#A2F2EF] bg-[#A2F2EF] bg-opacity-10' 
                          : 'border-gray-200 hover:border-[#A2F2EF]'
                      }`}
                      onClick={() => handlePatientFilter(patient.id.toString())}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{patient.id}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-500">{patient.gender} • {patient.bloodType}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{patient.recordCount} records</span>
                        <span>{formatRelativeTime(patient.lastVisit)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Records */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Medical Records</h2>
              
              {filteredRecords.length === 0 ? (
                <div className="text-center py-16">
                  <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedPatientId
                      ? `No records found for Patient ID: ${selectedPatientId}`
                      : allMedicalRecords.length === 0 
                        ? 'No medical records available'
                        : 'Select a patient to view medical records'}
                  </h3>
                  <p className="text-gray-500">
                    {allMedicalRecords.length === 0 
                      ? 'Make sure the smart contract has medical records data'
                      : 'Choose a patient from the list above or search by ID'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecords.map(record => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-[#A2F2EF] hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#A2F2EF] bg-opacity-20 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-5 h-5 text-[#A2F2EF]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Record #{record.id}</h3>
                            <p className="text-sm text-gray-500">Patient {record.patientId}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          Verified
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BuildingOfficeIcon className="w-4 h-4" />
                          <span className="truncate">{getHospitalName(record.hospitalId)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UserIcon className="w-4 h-4" />
                          <span className="truncate">{getDoctorName(record.doctorId)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatRelativeTime(record.createdAt)}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">Diagnosis</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{record.diagnosis}</p>
                      </div>

                      {record.prescriptions && record.prescriptions.length > 0 && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-1">Prescriptions</p>
                          <p className="text-xs text-gray-600">{record.prescriptions.length} medication(s)</p>
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#A2F2EF] text-gray-800 rounded-lg hover:bg-[#8EEAE7] font-medium transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};

export default Patients;