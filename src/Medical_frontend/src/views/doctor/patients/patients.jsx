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
} from '@heroicons/react/24/outline';
import { Principal } from '@dfinity/principal';

const Patients = ({ principal, actor }) => {
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (actor && principal && principal !== '2vxsx-fae') {
      loadBlockchainData();
    } else {
      setError('Authentication required or anonymous principal detected. Please log in.');
    }
  }, [actor, principal]);

  const loadBlockchainData = async () => {
    if (!actor) {
      setError('Blockchain connection not available. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [hospitalsData, doctorsData, allRecords] = await Promise.all([
        actor.getHospitals(),
        actor.getDoctors(),
        actor.getMedicalRecordsByPatient(),
      ]);

      const normalizedHospitals = hospitalsData.map(hospital => ({
        id: Number(hospital.id),
        name: hospital.name,
        walletAddress: hospital.walletAddress.toString(),
        isActive: hospital.isActive,
        logoURL: hospital.logoURL,
      }));

      const normalizedDoctors = doctorsData.map(doctor => ({
        id: Number(doctor.id),
        hospitalId: Number(doctor.hospitalId),
        name: doctor.name,
        specialty: doctor.specialty,
        walletAddress: doctor.walletAddress.toString(),
        isActive: doctor.isActive,
        photoURL: doctor.photoURL,
      }));

      const uniquePatientIds = [...new Set(allRecords.map(record => Number(record.patientId)))];
      const dummyPatients = uniquePatientIds.map(id => ({
        id,
        name: `Patient ${id}`,
        dateOfBirth: `1990-01-${id < 10 ? '0' + id : id}`,
        bloodType: ['A+', 'B+', 'AB+', 'O+'][id % 4],
        gender: id % 2 === 0 ? 'Male' : 'Female',
        address: `Address ${id}, City`,
        isActive: true,
      }));

      setHospitals(normalizedHospitals);
      setDoctors(normalizedDoctors);
      setPatients(dummyPatients);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setError('Failed to load data from blockchain. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientRecords = async (patientId) => {
    if (!actor || !patientId) {
      setError('Invalid patient ID or blockchain connection missing.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const records = await actor.getMedicalRecordsByPatient(parseInt(patientId));
      setMedicalRecords(records.map(record => ({
        ...record,
        id: Number(record.id),
        patientId: Number(record.patientId),
        hospitalId: Number(record.hospitalId),
        doctorId: Number(record.doctorId),
        createdAt: Number(record.createdAt),
      })));
    } catch (error) {
      console.error('Error loading patient records:', error);
      setError('Failed to load patient records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePatientFilter = (patientId) => {
    setSelectedPatientId(patientId);
    setFilterHospital('');
    if (patientId) {
      loadPatientRecords(patientId);
    } else {
      setMedicalRecords([]);
    }
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find(h => Number(h.id) === Number(hospitalId));
    return hospital?.name || 'Unknown Hospital';
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => Number(d.id) === Number(doctorId));
    return doctor?.name || 'Unknown Doctor';
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp / 1000000);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRecords = medicalRecords.filter(record => 
    !filterHospital || Number(record.hospitalId) === Number(filterHospital)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex justify-between items-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Medical Records</h1>
            <p className="text-gray-600 mt-1">View patient medical records on Internet Computer blockchain</p>
            {principal && (
              <p className="text-sm text-green-600 mt-2">
                Connected as: {principal.slice(0, 10)}...{principal.slice(-8)}
              </p>
            )}
          </div>
          <button
            onClick={async () => {
              if (!actor) {
                setError('Blockchain connection not available. Please log in again.');
                return;
              }
              try {
                const allRecords = await actor.getMedicalRecordsByPatient();
                console.log('All patient records:', allRecords);
              } catch (error) {
                console.error('Error logging records:', error);
                setError('Failed to log patient records.');
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            disabled={!actor}
          >
            Log All Records
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A2F2EF]"></div>
            <span className="ml-3 text-gray-600">Loading data...</span>
          </div>
        )}

        {/* Patients List */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Patients</h2>
            {patients.length === 0 ? (
              <div className="text-center py-12">
                <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h3>
                <p className="text-gray-500">No patients are registered based on medical records yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map(patient => (
                      <tr key={patient.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.dateOfBirth}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.bloodType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {patient.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handlePatientFilter(patient.id.toString())}
                            className="text-[#A2F2EF] hover:text-[#8EEAE7] font-medium"
                          >
                            View Records
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Patient Filter and Records */}
        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Records Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  placeholder="Search by Patient ID..."
                  value={selectedPatientId}
                  onChange={(e) => handlePatientFilter(e.target.value)}
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
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-600 flex items-center">
                Total: {filteredRecords.length} records
              </div>
            </div>
          </div>
        )}

        {/* Records List */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedPatientId
                    ? `No medical records found for Patient ID: ${selectedPatientId}`
                    : 'Enter a Patient ID to view medical records'}
                </h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredRecords.map(record => (
                <div
                  key={record.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="w-5 h-5 text-[#A2F2EF]" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Record #{record.id}</h3>
                        <p className="text-sm text-gray-500">Patient ID: {record.patientId}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-[#A2F2EF]/20 text-gray-800 px-2 py-1 rounded-full">Blockchain</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BuildingOfficeIcon className="w-4 h-4" />
                      <span>{getHospitalName(record.hospitalId)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserIcon className="w-4 h-4" />
                      <span>{getDoctorName(record.doctorId)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(record.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      <span>{record.diagnosis}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-[#A2F2EF]" />
                      <a
                        href={record.cpptURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#A2F2EF] hover:text-[#8EEAE7] underline"
                      >
                        View CPPT Document
                      </a>
                    </div>
                    {record.evidenceURLs.length > 0 && (
                      <div className="flex items-start gap-2">
                        <PhotoIcon className="w-4 h-4 text-[#A2F2EF]" />
                        <div>
                          {record.evidenceURLs.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#A2F2EF] hover:text-[#8EEAE7] underline block text-sm"
                            >
                              Evidence {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;