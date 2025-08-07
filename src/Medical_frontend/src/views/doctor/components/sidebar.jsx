import React from 'react';
import {
  Squares2X2Icon,
  CalendarDateRangeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  CubeIcon,
  EnvelopeIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Squares2X2Icon, to: '/doctor' },
    { id: 'patients', label: 'Patients', icon: UsersIcon, to: '/doctor/patients' },
    { id: 'Medical Records', label: 'Medical Records', icon: UserCircleIcon, to: '/doctor/medicalrecord' },
    { id: 'departments', label: 'Departments', icon: BuildingOfficeIcon, to: '/doctor/departments' },
    { id: 'schedule', label: "Doctors' Schedule", icon: CalendarDaysIcon, to: '/doctor/schedule' },
    { id: 'inventory', label: 'Inventory', icon: CubeIcon, to: '/inventory' },
    { id: 'messages', label: 'Messages', icon: EnvelopeIcon, to: '/messages' },
  ];

  return (
    <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="flex items-center px-3 py-6">
        <div className="w-8 h-8 bg-gradient-to-br bg-[#A2F2EF] rounded-lg flex items-center justify-center mr-2">
          <span className="text-white font-bold text-lg">+</span>
        </div>
        <span className="text-xl font-semibold text-gray-800">WellNest</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-2 px-5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => `
                flex items-center px-1 py-2 mb-1 rounded-xl cursor-pointer transition-all duration-200 relative
                ${isActive
                  ? 'bg-[#A2F2EF]'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;