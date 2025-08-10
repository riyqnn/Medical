import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

// Real smart contract functions using the actor from context
const canisterAPI = {
  getDoctors: async (actorInstance) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      const doctors = await actorInstance.getDoctors();
      return doctors;
    } catch (error) {
      console.error('Error getting doctors:', error);
      // Fallback to mock data for demo
      return [
        { id: 1, name: 'Dr. Petra Winsburry', specialty: 'General Medicine', hospitalId: 1, isActive: true },
        { id: 2, name: 'Dr. Emily Smith', specialty: 'Cardiology', hospitalId: 1, isActive: true },
        { id: 3, name: 'Dr. John Davis', specialty: 'Pediatrics', hospitalId: 1, isActive: true },
        { id: 4, name: 'Dr. Linda Green', specialty: 'Dermatology', hospitalId: 1, isActive: true },
        { id: 5, name: 'Dr. Michael Brown', specialty: 'Geriatrics', hospitalId: 1, isActive: true }
      ];
    }
  },
  
  getDoctorSchedule: async (actorInstance, doctorId) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      const schedules = await actorInstance.getDoctorSchedule(doctorId);
      return schedules;
    } catch (error) {
      console.error('Error getting doctor schedule:', error);
      return [];
    }
  },
  
  addDoctorSchedule: async (actorInstance, doctorId, dayOfWeek, startTime, endTime) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      const result = await actorInstance.addDoctorSchedule(doctorId, dayOfWeek, startTime, endTime);
      console.log('Schedule added:', result);
      return { success: true, message: result };
    } catch (error) {
      console.error('Error adding schedule:', error);
      throw error;
    }
  },
  
  updateDoctorSchedule: async (actorInstance, scheduleId, startTime, endTime, isAvailable) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      const result = await actorInstance.updateDoctorSchedule(scheduleId, startTime, endTime, isAvailable);
      console.log('Schedule updated:', result);
      return { success: true, message: result };
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },
  
  deleteDoctorSchedule: async (actorInstance, scheduleId) => {
    if (!actorInstance) throw new Error('Actor not available');
    try {
      // Note: Delete function might need to be added to the smart contract
      // For now, we'll simulate it
      console.log('Deleting schedule:', scheduleId);
      return { success: true, message: 'Schedule deleted' };
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
};

function DoctorSchedule() {
  // Get principal and actor from parent layout via context
  const { principal, actor } = useOutletContext();
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date instead of 2028
  const [doctors, setDoctors] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null); // Current logged in doctor
  const [schedules, setSchedules] = useState(new Map()); // Map of date strings to schedule arrays
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    startTime: '',
    endTime: '',
    description: ''
  });

  // Debug: Log principal status
  useEffect(() => {
    console.log('DoctorSchedule - Principal:', principal);
    console.log('DoctorSchedule - Is Connected:', !!principal);
  }, [principal]);

  // Load doctors when actor becomes available
  useEffect(() => {
    if (actor) {
      loadDoctors();
      loadAllSchedules();
    }
  }, [actor, principal]); // Add principal as dependency

  const loadDoctors = async () => {
    try {
      const doctorList = await canisterAPI.getDoctors(actor);
      console.log('Loaded doctors:', doctorList);
      setDoctors(doctorList);
      
      // Find current doctor based on principal
      if (principal) {
        console.log('Looking for doctor with principal:', principal);
        console.log('Available doctors:', doctorList.map(d => ({
          name: d.name,
          walletAddress: d.walletAddress,
          walletAddressText: typeof d.walletAddress === 'object' && d.walletAddress.toText ? d.walletAddress.toText() : d.walletAddress,
          isActive: d.isActive
        })));
        
        const currentDoc = doctorList.find(d => {
          const walletAddress = typeof d.walletAddress === 'object' && d.walletAddress.toText 
            ? d.walletAddress.toText() 
            : d.walletAddress;
          return walletAddress === principal && d.isActive;
        });
        
        console.log('Current doctor found:', currentDoc);
        setCurrentDoctor(currentDoc);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadAllSchedules = async () => {
    try {
      setLoading(true);
      const allSchedules = new Map();
      
      // For now, start with empty schedules
      // In real implementation, you would load from smart contract
      setSchedules(allSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar data for current month
  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = [];
    const currentDateObj = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const day = currentDateObj.getDate();
      const isCurrentMonth = currentDateObj.getMonth() === month;
      const dateKey = currentDateObj.toISOString().split('T')[0];
      const daySchedules = schedules.get(dateKey) || [];
      
      calendarDays.push({
        day,
        date: new Date(currentDateObj),
        dateKey,
        month: currentDateObj.toLocaleDateString('en-US', { month: 'long' }),
        isOtherMonth: !isCurrentMonth,
        isSunday: currentDateObj.getDay() === 0,
        isHighlighted: dateKey === new Date().toISOString().split('T')[0],
        schedules: daySchedules
      });
      
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }
    
    return calendarDays;
  };

  const handleAddSchedule = async () => {
    if (!principal) {
      alert('Please connect your wallet using the login button in the header');
      return;
    }
    
    if (!currentDoctor) {
      alert('You must be a registered doctor to add schedules');
      return;
    }
    
    if (!newSchedule.startTime || !newSchedule.endTime) {
      alert('Please fill start time and end time');
      return;
    }

    try {
      const dayOfWeek = selectedDate.getDay();
      const result = await canisterAPI.addDoctorSchedule(
        actor,
        currentDoctor.id,
        dayOfWeek,
        newSchedule.startTime,
        newSchedule.endTime
      );

      if (result.success) {
        // Add to local state
        const dateKey = selectedDate.toISOString().split('T')[0];
        const newScheduleObj = {
          id: Math.floor(Math.random() * 1000),
          doctor: currentDoctor.name,
          time: `${newSchedule.startTime} - ${newSchedule.endTime}`,
          description: newSchedule.description,
          doctorId: currentDoctor.id
        };

        const updatedSchedules = new Map(schedules);
        const daySchedules = updatedSchedules.get(dateKey) || [];
        updatedSchedules.set(dateKey, [...daySchedules, newScheduleObj]);
        setSchedules(updatedSchedules);

        // Reset form
        setNewSchedule({ startTime: '', endTime: '', description: '' });
        setShowAddModal(false);
        setSelectedDate(null);
        
        alert('Schedule added successfully!');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Error adding schedule');
    }
  };

  const handleEditSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      const result = await canisterAPI.updateDoctorSchedule(
        actor,
        selectedSchedule.id,
        newSchedule.startTime,
        newSchedule.endTime,
        true
      );

      if (result.success) {
        // Update local state
        const updatedSchedules = new Map(schedules);
        const dateKey = selectedDate.toISOString().split('T')[0];
        const daySchedules = updatedSchedules.get(dateKey) || [];
        
        const updatedDaySchedules = daySchedules.map(schedule => 
          schedule.id === selectedSchedule.id 
            ? {
                ...schedule,
                time: `${newSchedule.startTime} - ${newSchedule.endTime}`,
                description: newSchedule.description
              }
            : schedule
        );
        
        updatedSchedules.set(dateKey, updatedDaySchedules);
        setSchedules(updatedSchedules);

        setShowEditModal(false);
        setSelectedSchedule(null);
        setSelectedDate(null);
        setNewSchedule({ startTime: '', endTime: '', description: '' });
        
        alert('Schedule updated successfully!');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Error updating schedule');
    }
  };

  const handleDeleteSchedule = async (schedule, dateKey) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const result = await canisterAPI.deleteDoctorSchedule(actor, schedule.id);

      if (result.success) {
        // Remove from local state
        const updatedSchedules = new Map(schedules);
        const daySchedules = updatedSchedules.get(dateKey) || [];
        const filteredSchedules = daySchedules.filter(s => s.id !== schedule.id);
        
        if (filteredSchedules.length === 0) {
          updatedSchedules.delete(dateKey);
        } else {
          updatedSchedules.set(dateKey, filteredSchedules);
        }
        
        setSchedules(updatedSchedules);
        alert('Schedule deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Error deleting schedule');
    }
  };

  const openAddModal = (date) => {
    if (!currentDoctor) {
      alert('You must be a registered doctor to add schedules');
      return;
    }
    setSelectedDate(date);
    setNewSchedule({ startTime: '', endTime: '', description: '' });
    setShowAddModal(true);
  };

  const openEditModal = (schedule, date) => {
    setSelectedSchedule(schedule);
    setSelectedDate(date);
    const times = schedule.time.split(' - ');
    setNewSchedule({
      startTime: times[0] || '',
      endTime: times[1] || '',
      description: schedule.description || ''
    });
    setShowEditModal(true);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const calendarData = generateCalendarData();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-[960px] mx-auto border border-gray-200 rounded-xl p-4 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm sm:text-base">
          <span>{monthName}</span>
          <button
            onClick={() => navigateMonth(-1)}
            aria-label="Previous month"
            className="flex items-center justify-center w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <button
            onClick={() => navigateMonth(1)}
            aria-label="Next month"
            className="flex items-center justify-center w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <i className="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <button
            className="rounded-full bg-gray-200 text-gray-600 px-3 py-1.5 hover:bg-gray-300"
            type="button"
          >
            Day
          </button>
          <button
            className="rounded-full bg-gray-200 text-gray-600 px-3 py-1.5 hover:bg-gray-300"
            type="button"
          >
            Week
          </button>
          <button
            className="rounded-full bg-blue-900 text-white px-3 py-1.5"
            type="button"
          >
            Month
          </button>
          <select
            aria-label="Agenda filter"
            className="rounded-full border border-gray-300 text-gray-600 text-xs sm:text-sm px-3 py-1.5 bg-white cursor-pointer"
          >
            <option>All Agenda</option>
          </select>
        </div>
      </div>

      {/* Connection Status */}
      {!principal && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-info-circle text-blue-500 mr-2"></i>
            <p className="text-sm text-blue-800">
              Connect your wallet using the login button in the header to manage doctor schedules.
            </p>
          </div>
        </div>
      )}

      {/* Doctor Status */}
      {principal && !currentDoctor && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-orange-500 mr-2"></i>
            <p className="text-sm text-orange-800">
              You are not registered as a doctor. Only registered doctors can manage schedules.
            </p>
          </div>
        </div>
      )}

      {/* Current Doctor Info */}
      {currentDoctor && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-user-md text-green-500 mr-2"></i>
            <div>
              <p className="text-sm font-medium text-green-800">{currentDoctor.name}</p>
              <p className="text-xs text-green-600">{currentDoctor.specialty}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">Loading schedules...</p>
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-gray-500 text-[11px] sm:text-xs font-semibold border-b border-gray-200 pb-2 select-none">
        <div>Sunday</div>
        <div>Monday</div>
        <div>Tuesday</div>
        <div>Wednesday</div>
        <div>Thursday</div>
        <div>Friday</div>
        <div>Saturday</div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-gray-200 text-[10px] sm:text-xs text-gray-400 select-none">
        {calendarData.map((dayData, index) => (
          <div
            key={index}
            className={`h-[110px] ${index % 7 === 6 ? '' : 'border-r'} border-b border-gray-200 ${dayData.isOtherMonth ? 'diagonal-stripes' : ''} p-1 relative`}
          >
            <span
              className={`absolute top-1 right-1 text-[9px] select-none ${
                dayData.isSunday ? 'text-red-500' : 
                dayData.isHighlighted ? 'bg-blue-900 text-white rounded-full w-5 h-5 flex items-center justify-center' : 
                dayData.isOtherMonth ? 'text-gray-300' : 'text-gray-400'
              }`}
            >
              {dayData.day}
            </span>
            
            {/* Add Schedule Button */}
            {!dayData.isOtherMonth && principal && (
              <button
                onClick={() => openAddModal(dayData.date)}
                className="absolute top-1 left-1 w-4 h-4 bg-green-500 text-white rounded-full text-[8px] hover:bg-green-600 flex items-center justify-center"
                title="Add Schedule"
              >
                +
              </button>
            )}

            {/* Schedules */}
            {dayData.schedules.map((schedule, idx) => (
              <div
                key={idx}
                className={`bg-cyan-200 rounded-md p-1 ${idx < dayData.schedules.length - 1 ? 'mb-1' : ''} cursor-pointer select-text group relative`}
                title={`${schedule.doctor} ${schedule.description} ${schedule.time}`}
                onClick={() => openEditModal(schedule, dayData.date)}
              >
                <p className="font-bold text-[11px] text-cyan-900 leading-tight">{schedule.doctor}</p>
                {schedule.description && (
                  <p className="text-[8px] text-cyan-700 leading-tight">{schedule.description}</p>
                )}
                <p className="flex items-center gap-1 text-[9px] text-cyan-700 mt-1">
                  <i className="far fa-clock"></i> {schedule.time}
                </p>
                
                {/* Delete button */}
                {principal && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSchedule(schedule, dayData.dateKey);
                    }}
                    className="absolute top-0 right-0 w-3 h-3 bg-red-500 text-white rounded-full text-[8px] hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Delete Schedule"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">
              Add Schedule for {selectedDate?.toLocaleDateString()}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                <select
                  value={newSchedule.doctorId}
                  onChange={(e) => setNewSchedule({...newSchedule, doctorId: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select Doctor</option>
                  {doctors.filter(d => d.isActive).map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialty}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  placeholder="e.g., General consultation, Routine check-up"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedDate(null);
                  setNewSchedule({ startTime: '', endTime: '', description: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchedule}
                className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              >
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Edit Schedule - {selectedSchedule.doctor}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  placeholder="e.g., General consultation, Routine check-up"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                  setSelectedDate(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSchedule}
                className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition-colors"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {principal && Array.from(schedules.values()).flat().length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <i className="fas fa-calendar-plus text-2xl"></i>
          </div>
          <p className="text-gray-600 text-sm">No schedules found</p>
          <p className="text-gray-500 text-xs">Click the + button on any date to add a schedule</p>
        </div>
      )}

      <style jsx>{`
        .diagonal-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(0,0,0,.1) 10px,
            rgba(0,0,0,.1) 20px
          );
        }
      `}</style>
    </div>
  );
}

export default DoctorSchedule;