import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

const Buy = () => {
  const { principal, actor } = useOutletContext(); // Get principal and actor from Outlet context
  const [formData, setFormData] = useState({
    hospitalName: '',
    logoURL: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [registrationResult, setRegistrationResult] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewURL, setLogoPreviewURL] = useState('');

  // Handle logo file changes
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoPreviewURL(url);
      setFormData((prev) => ({ ...prev, logoURL: url }));

      // Cleanup URL object to prevent memory leaks
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setLogoPreviewURL('');
    }
  }, [logoFile]);

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

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      if (errors.logoURL) {
        setErrors((prev) => ({
          ...prev,
          logoURL: '',
        }));
      }
    }
  };

  const handleFilePaste = (e) => {
    const items = (e.clipboardData || window.clipboardData).items;
    for (let item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        setLogoFile(file);
        if (errors.logoURL) {
          setErrors((prev) => ({
            ...prev,
            logoURL: '',
          }));
        }
        break;
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      if (errors.logoURL) {
        setErrors((prev) => ({
          ...prev,
          logoURL: '',
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.hospitalName.trim()) {
      newErrors.hospitalName = 'Nama rumah sakit wajib diisi';
    }
    if (!logoFile && !formData.logoURL) {
      newErrors.logoURL = 'Logo wajib diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!actor) {
      setErrors({ submit: 'Blockchain connection not initialized. Please connect your wallet first.' });
      return;
    }

    if (!principal) {
      setErrors({ submit: 'Principal not found. Please connect your wallet first.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await actor.registerHospital(
        formData.hospitalName.trim(),
        formData.logoURL || logoPreviewURL
      );
      console.log('Registration result:', result);
      setRegistrationResult(result);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Registration failed:', error);
      let errorMessage = 'Pendaftaran gagal. Silakan coba lagi.';
      if (error.message) {
        if (error.message.includes('rejected')) {
          errorMessage = 'Transaksi ditolak. Pastikan Anda memiliki akses yang diperlukan.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Koneksi jaringan bermasalah. Silakan coba lagi.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ hospitalName: '', logoURL: '' });
    setLogoFile(null);
    setLogoPreviewURL('');
    setErrors({});
    setSubmitSuccess(false);
    setRegistrationResult('');
  };

  // Show connection requirement if no principal or actor
  if (!principal || !actor) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <BuildingOfficeIcon className="w-16 h-16 text-[#A2F2EF] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet Connection Required</h2>
          <p className="text-gray-600 mb-6">
            Please connect your Internet Identity wallet to register a hospital.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Register Hospital</h1>
            <p className="text-gray-600 mt-1">Register a new hospital to the Internet Computer blockchain</p>
            {principal && (
              <p className="text-sm text-[#A2F2EF] mt-1">
                Connected as: {`${principal.slice(0, 6)}...${principal.slice(-4)}`}
              </p>
            )}
          </div>
        </div>

        {!submitSuccess ? (
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-64 flex items-center justify-center relative">
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onPaste={handleFilePaste}
                  tabIndex={0}
                >
                  {logoPreviewURL || formData.logoURL ? (
                    <div className="relative w-full h-full">
                      <img
                        src={logoPreviewURL || formData.logoURL}
                        alt="Hospital Logo Preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => {
                          setLogoFile(null);
                          setFormData((prev) => ({ ...prev, logoURL: '' }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <BuildingOfficeIcon className="w-12 h-12 text-[#A2F2EF] mb-2" />
                      <p className="text-gray-600 text-center">Drag & Drop or Paste Image</p>
                      <p className="text-sm text-gray-500">or</p>
                      <label className="text-[#A2F2EF] hover:text-[#8EEAE7] text-sm font-medium cursor-pointer">
                        Upload File
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </>
                  )}
                </div>
                {errors.logoURL && <p className="text-red-500 text-sm mt-2 absolute -bottom-6">{errors.logoURL}</p>}
              </div>

              {/* Form Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Hospital Details</h2>
                <p className="text-gray-600">Enter the required information to register your hospital</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name * <span className="text-xs text-blue-600">(will be stored on blockchain)</span>
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#A2F2EF] focus:border-transparent ${
                      errors.hospitalName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="RS. Contoh Medical Center"
                    maxLength={100}
                  />
                  {errors.hospitalName && <p className="mt-1 text-sm text-red-600">{errors.hospitalName}</p>}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">{errors.submit}</p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !actor || !principal}
                    className="px-6 py-2 bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      'Register Hospital'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-12">
            <BuildingOfficeIcon className="w-16 h-16 text-[#A2F2EF] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{registrationResult}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleReset}
                className="bg-[#A2F2EF] hover:bg-[#8EEAE7] text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Register Another Hospital
              </button>
              <button
                onClick={() => window.history.back()}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Buy;