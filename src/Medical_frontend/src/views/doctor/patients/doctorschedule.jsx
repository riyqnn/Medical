import React from 'react';

function DoctorSchedule() {
  // Sample data for the calendar (July 2028)
  const calendarData = [
    { day: 26, month: 'June', schedules: [], isOtherMonth: true },
    { day: 27, month: 'June', schedules: [], isOtherMonth: true },
    { day: 28, month: 'June', schedules: [], isOtherMonth: true },
    { day: 29, month: 'June', schedules: [], isOtherMonth: true },
    { day: 30, month: 'June', schedules: [], isOtherMonth: true },
    { day: 31, month: 'June', schedules: [], isOtherMonth: true },
    {
      day: 1,
      month: 'July',
      schedules: [
        { doctor: 'Dr. Petra Winsburry', time: '09:00 AM', description: '' },
        { doctor: 'Dr. Emily Smith', time: '10:00 AM', description: '' }
      ]
    },
    { day: 2, month: 'July', schedules: [], isSunday: true },
    {
      day: 3,
      month: 'July',
      schedules: [
        { doctor: 'Dr. John Davis', time: '11:00 AM', description: '' },
        { doctor: 'Dr. Linda Green', time: '01:00 PM', description: '' }
      ]
    },
    {
      day: 4,
      month: 'July',
      schedules: [
        { doctor: 'Dr. Michael Brown', time: '02:00 PM', description: '' },
        { doctor: 'Dr. Petra Winsburry', time: '03:00 PM', description: '' }
      ]
    },
    {
      day: 5,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Emily Smith',
          time: '04:00 PM',
          description: 'Chronic Disease Management for Hypertension with Patricia Clark'
        }
      ]
    },
    {
      day: 6,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Petra Winsburry',
          time: '10:00 AM',
          description: 'Acute Illness Treatment for Flu Symptoms with Robert Brown'
        }
      ]
    },
    {
      day: 7,
      month: 'July',
      schedules: [
        { doctor: 'Dr. John Davis', time: '09:00 AM', description: '' },
        { doctor: 'Dr. Linda Green', time: '10:00 AM', description: '' }
      ]
    },
    { day: 8, month: 'July', schedules: [] },
    {
      day: 9,
      month: 'July',
      schedules: [
        { doctor: 'Dr. Michael Brown', time: '11:00 AM', description: '' },
        { doctor: 'Dr. Petra Winsburry', time: '01:00 PM', description: '' }
      ],
      isSunday: true
    },
    { day: 10, month: 'July', schedules: [] },
    {
      day: 11,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Emily Smith',
          time: '02:00 PM',
          description: 'Chronic Disease Management for Asthma with Rachel Green'
        }
      ]
    },
    {
      day: 12,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. John Davis',
          time: '03:00 PM',
          description: 'Acute Illness Treatment for Skin Rash with Daniel Lewis'
        }
      ]
    },
    { day: 13, month: 'July', schedules: [] },
    {
      day: 14,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Linda Green',
          time: '04:00 PM',
          description: 'Preventive Care Consultation with Nancy Martinez'
        }
      ]
    },
    {
      day: 15,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Petra Winsburry',
          time: '09:00 AM',
          description: 'Routine Check-Up with John Smith'
        }
      ]
    },
    { day: 16, month: 'July', schedules: [], isSunday: true },
    {
      day: 17,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Emily Smith',
          time: '10:00 AM',
          description: 'Chronic Disease Management for Diabetes Check-Up with Sarah Johnson'
        }
      ]
    },
    {
      day: 18,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. John Davis',
          time: '11:00 AM',
          description: 'Acute Illness Treatment for Flu Symptoms with James Brown'
        }
      ]
    },
    {
      day: 19,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Linda Green',
          time: '01:00 PM',
          description: 'Preventive Care Consultation with Susan Clark'
        }
      ]
    },
    { day: 20, month: 'July', schedules: [], isHighlighted: true },
    {
      day: 21,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Michael Brown',
          time: '02:00 PM',
          description: 'Geriatric Care for Arthritis Management with Robert Wilson'
        }
      ]
    },
    { day: 22, month: 'July', schedules: [] },
    {
      day: 23,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Petra Winsburry',
          time: '03:00 PM',
          description: 'Routine Check-Up with Emily Thompson'
        }
      ],
      isSunday: true
    },
    { day: 24, month: 'July', schedules: [] },
    { day: 25, month: 'July', schedules: [] },
    {
      day: 26,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Emily Smith',
          time: '04:00 PM',
          description: 'Chronic Disease Management for Hypertension with Jessica Green'
        }
      ]
    },
    {
      day: 27,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. John Davis',
          time: '09:00 AM',
          description: 'Acute Illness Treatment for Respiratory Infection with Michael White'
        }
      ]
    },
    {
      day: 28,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Linda Green',
          time: '10:00 AM',
          description: 'Preventive Care Consultation with Jennifer Harris'
        }
      ]
    },
    {
      day: 29,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Michael Brown',
          time: '11:00 AM',
          description: 'Geriatric Care for Medication Review with Barbara Lewis'
        }
      ]
    },
    { day: 30, month: 'July', schedules: [], isSunday: true },
    {
      day: 31,
      month: 'July',
      schedules: [
        {
          doctor: 'Dr. Petra Winsburry',
          time: '01:00 PM',
          description: 'Routine Check-Up with David Thompson'
        }
      ]
    },
    { day: 1, month: 'August', schedules: [], isOtherMonth: true },
    { day: 2, month: 'August', schedules: [], isOtherMonth: true },
    { day: 3, month: 'August', schedules: [], isOtherMonth: true },
    { day: 4, month: 'August', schedules: [], isOtherMonth: true },
    { day: 5, month: 'August', schedules: [], isOtherMonth: true }
  ];

  return (
    <div className="max-w-[960px] mx-auto border border-gray-200 rounded-xl p-4 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm sm:text-base">
          <span>July 2028</span>
          <button
            aria-label="Previous month"
            className="flex items-center justify-center w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <i className="fas fa-chevron-left text-xs"></i>
          </button>
          <button
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
          <button
            type="button"
            className="rounded-md bg-blue-900 text-white text-xs sm:text-sm px-3 py-1.5 flex items-center gap-1 hover:bg-blue-800"
          >
            <i className="fas fa-plus text-[10px]"></i> Add Schedule
          </button>
        </div>
      </div>

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
            {dayData.schedules.map((schedule, idx) => (
              <div
                key={idx}
                className={`bg-cyan-200 rounded-md p-1 ${idx < dayData.schedules.length - 1 ? 'mb-1' : ''} cursor-default select-text`}
                title={`${schedule.doctor} ${schedule.description} ${schedule.time}`}
              >
                <p className="font-bold text-[11px] text-cyan-900 leading-tight">{schedule.doctor}</p>
                {schedule.description && (
                  <p className="text-[8px] text-cyan-700 leading-tight">{schedule.description}</p>
                )}
                <p className="flex items-center gap-1 text-[9px] text-cyan-700 mt-1">
                  <i className="far fa-clock"></i> {schedule.time}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorSchedule;