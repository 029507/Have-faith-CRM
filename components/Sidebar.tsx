// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  Link2,
  FileText,
  Settings,
  DollarSign,
  Briefcase,
  Phone,
  Building,
  Home,
  Menu,
  Trash2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/leads', label: 'Leads', icon: TrendingUp },
  { href: '/campaigns', label: 'Campaigns', icon: BarChart3 },
  { href: '/payment-links', label: 'Payment Links', icon: Link2 },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/services', label: 'Services', icon: Briefcase },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/employees', label: 'Employees', icon: Phone },
  { href: '/users', label: 'Users', icon: Settings },
  { href: '/banks', label: 'Banks', icon: Building },
  { href: '/b2b-productivity', label: 'B2B Productivity', icon: DollarSign },
  { href: '/trash', label: 'Trash', icon: Trash2 },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [pathname, setPathname] = useState('');
  const pathnameHook = usePathname();

  useEffect(() => {
    setPathname(pathnameHook);
  }, [pathnameHook]);

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {isOpen && <h1 className="text-xl font-bold">Have Faith Solutions</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-800 rounded"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={!isOpen ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        {isOpen && <p>Demo Mode</p>}
      </div>
    </aside>
  );
}
