import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const MedicalRecord = () => {
  const { principal, actor } = useOutletContext(); // Ambil principal dan actor dari Outlet
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [userHospitals, setUserHospitals] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [filterHospital, setFilterHospital] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actorError, setActorError] = useState(null);

  const [formData, setFormData] = useState({
    patientId: '',
    hospitalId: '',
    diagnosis: '',
    cpptURL: '',
    evidenceURLs: [''],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('MedicalRecord mounted, principal:', principal, 'actor:', actor);
    if (actor && principal && principal !== '2vxsx-fae') {
      loadBlockchainData();
    } else {
      console.warn('Cannot load data: principal or actor missing, or principal is anonymous');
    }
  }, [actor, principal]);

  const loadBlockchainData = async () => {
    if (!actor) {
      console.warn('No actor provided to loadBlockchainData');
      setActorError('No blockchain connection available. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Current principal:', principal);
      const [hospitalsData, doctorsData] = await Promise.all([
        actor.getHospitals(),
        actor.getDoctors(),
      ]);

      console.log('Raw hospitals data:', hospitalsData);
      console.log('Raw doctors data:', doctorsData);

      const normalizedHospitals = hospitalsData.map(hospital => ({
        ...hospital,
        id: Number(hospital.id),
      }));
      const normalizedDoctors = doctorsData.map(doctor => ({
        ...doctor,
        id: Number(doctor.id),
        hospitalId: Number(doctor.hospitalId),
        walletAddress: doctor.walletAddress.toString(),
      }));

      console.log('Normalized hospitals:', normalizedHospitals);
      console.log('Normalized doctors:', normalizedDoctors);

      const userDoctorRecords = normalizedDoctors.filter(
        doctor => {
          const isMatch = doctor.walletAddress.toLowerCase() === principal?.toLowerCase() && doctor.isActive;
          console.log(`Checking doctor: ${doctor.walletAddress}, isActive: ${doctor.isActive}, matches principal: ${isMatch}`);
          return isMatch;
        }
      );

      console.log('User doctor records:', userDoctorRecords);

      const userHospitalIds = userDoctorRecords.map(doctor => Number(doctor.hospitalId));
      const userHospitalsData = normalizedHospitals.filter(hospital => userHospitalIds.includes(Number(hospital.id)));

      console.log('User hospitals:', userHospitalsData);

      setHospitals(normalizedHospitals);
      setDoctors(normalizedDoctors);
      setUserHospitals(userHospitalsData);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setActorError('Failed to load data from blockchain. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientRecords = async (patientId) => {
    if (!actor || !patientId) return;

    setIsLoading(true);
    try {
      const records = await actor.getMedicalRecordsByPatient(parseInt(patientId));
      setMedicalRecords(records);
      console.log('Loaded patient records:', records);
    } catch (error) {
      console.error('Error loading patient records:', error);
      setActorError('Failed to load patient records from blockchain.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleEvidenceURLChange = (index, value) => {
    const newEvidenceURLs = [...formData.evidenceURLs];
    newEvidenceURLs[index] = value;
    setFormData((prev) => ({
      ...prev,
      evidenceURLs: newEvidenceURLs,
    }));
  };

  const addEvidenceURL = () => {
    setFormData((prev) => ({
      ...prev,
      evidenceURLs: [...prev.evidenceURLs, ''],
    }));
  };

  const removeEvidenceURL = (index) => {
    const newEvidenceURLs = formData.evidenceURLs.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      evidenceURLs: newEvidenceURLs,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientId) newErrors.patientId = 'Patient ID is required';
    if (!formData.hospitalId) newErrors.hospitalId = 'Hospital selection is required';
    if (!formData.diagnosis) newErrors.diagnosis = 'Diagnosis is required';
    if (!formData.cpptURL) newErrors.cpptURL = 'CPPT Document URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!actor) {
      setErrors({ submit: 'Blockchain connection not initialized. Please try logging in again.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const validEvidenceURLs = formData.evidenceURLs.filter((url) => url.trim() !== '');
      const result = await actor.addMedicalRecord(
        parseInt(formData.patientId),
        parseInt(formData.hospitalId),
        formData.diagnosis,
        formData.cpptURL,
        validEvidenceURLs
      );

      if (result.includes('Unauthorized')) {
        setErrors({ submit: result });
        return;
      }

      console.log('Medical record added:', result);

      setFormData({
        patientId: '',
        hospitalId: '',
        diagnosis: '',
        cpptURL: '',
        evidenceURLs: [''],
      });

      alert(`Medical record added successfully: ${result}`);

      if (selectedPatientId === formData.patientId) {
        await loadPatientRecords(formData.patientId);
      }
    } catch (error) {
      console.error('Failed to add medical record:', error);
      setErrors({ submit: 'Failed to add medical record to blockchain. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientFilter = async (patientId) => {
    setSelectedPatientId(patientId);
    setFilterHospital('');
    if (patientId) {
      await loadPatientRecords(patientId);
    } else {
      setMedicalRecords([]);
    }
  };

  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find((h) => Number(h.id) === Number(hospitalId));
    return hospital ? hospital.name : 'Unknown Hospital';
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => Number(d.id) === Number(doctorId));
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesHospital = !filterHospital || Number(record.hospitalId) === Number(filterHospital);
    return matchesHospital;
  });

  if (!principal || principal === '2vxsx-fae') {
    return (
      <div className="p-6 text-center py-12">
        <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-8">
          Please login via Internet Identity to access medical records.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  if (!isLoading && userHospitals.length === 0 && activeTab === 'add') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Hospital Access</h2>
          <p className="text-gray-600 mb-4">
            You are not registered as an active doctor in any hospital.
            Please contact a hospital owner to register you as a doctor.
          </p>
          <p className="text-gray-600 mb-8">
            Available hospitals: {hospitals.length > 0 ? hospitals.map(h => h.name).join(', ') : 'None'}
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Current wallet: {principal}
          </div>
          <button
            onClick={() => setActiveTab('view')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back to Medical Records
          </button>
          {/* Tombol debugging sementara */}
          <button
            onClick={async () => {
              const doctors = await actor.getDoctors();
              console.log('All doctors:', doctors);
            }}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Log All Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <p className="text-gray-600 mt-1">Manage patient medical records on Internet Computer blockchain</p>
          </div>
          <div className="flex gap-4">
            {activeTab === 'view' && (
              <button
                onClick={() => setActiveTab('add')}
                className="bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Add Medical Record
              </button>
            )}
            <button
              onClick={async () => {
                const doctors = await actor.getDoctors();
                console.log('All doctors:', doctors);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Log All Doctors
            </button>
          </div>
        </div>

        {actorError && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 mb-6">
            <p className="text-red-800 font-medium">{actorError}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A2F2EF]"></div>
            <span className="ml-3 text-gray-600">Loading medical records...</span>
          </div>
        )}

        {activeTab === 'add' && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <button
                onClick={() => setActiveTab('view')}
                className="text-[#A2F2EF] hover:text-[#8EEAE7] font-medium mb-4 flex items-center gap-2"
              >
                ← Back to Medical Records
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Add New Medical Record</h2>
              <p className="text-gray-600 mt-1">Register a new medical record to the blockchain</p>
              <div className="text-sm text-blue-600 mt-2">
                Logged in as: {principal}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient ID * <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent ${
                        errors.patientId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter patient ID"
                    />
                  </div>
                  {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital * <span className="text-xs text-blue-600">(only hospitals where you are registered)</span>
                  </label>
                  <select
                    name="hospitalId"
                    value={formData.hospitalId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent ${
                      errors.hospitalId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Hospital</option>
                    {userHospitals.map((hospital) => (
                      <option key={Number(hospital.id)} value={Number(hospital.id)}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                  {errors.hospitalId && <p className="mt-1 text-sm text-red-600">{errors.hospitalId}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    You can only add records for hospitals where you are an active doctor
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis * <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
                  </label>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    rows="3"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent ${
                      errors.diagnosis ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter diagnosis details"
                  />
                  {errors.diagnosis && <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPPT Document URL * <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
                  </label>
                  <input
                    type="url"
                    name="cpptURL"
                    value={formData.cpptURL}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent ${
                      errors.cpptURL ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/cppt.pdf"
                  />
                  {errors.cpptURL && <p className="mt-1 text-sm text-red-600">{errors.cpptURL}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence URLs (Optional) <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
                </label>
                {formData.evidenceURLs.map((url, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleEvidenceURLChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent"
                      placeholder="https://example.com/evidence.jpg"
                    />
                    {formData.evidenceURLs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEvidenceURL(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEvidenceURL}
                  className="text-[#A2F2EF] hover:text-[#8EEAE7] text-sm font-medium"
                >
                  + Add Another Evidence URL
                </button>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">{errors.submit}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      patientId: '',
                      hospitalId: '',
                      diagnosis: '',
                      cpptURL: '',
                      evidenceURLs: [''],
                    })
                  }
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !actor}
                  className="px-6 py-2 bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2 inline-block"></div>
                      Registering to Blockchain...
                    </>
                  ) : (
                    'Register Medical Record'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'view' && !isLoading && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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
                  {userHospitals.map((hospital) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedPatientId
                      ? `No medical records found for Patient ID: ${selectedPatientId}`
                      : 'Enter a Patient ID to view medical records'}
                  </h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                </div>
              )}
              {filteredRecords.map((record) => (
                <div
                  key={Number(record.id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="w-5 h-5 text-[#A2F2EF]" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Record #{Number(record.id)}</h3>
                        <p className="text-sm text-gray-500">Patient ID: {Number(record.patientId)}</p>
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecord;