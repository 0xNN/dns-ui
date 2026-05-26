import { format } from 'date-fns';

export interface SampleUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  department: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  salary: number;
  description: string;
  address: string;
}

export const SAMPLE_USERS: SampleUser[] = Array.from({ length: 65 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ['admin', 'user', 'moderator'][Math.floor(Math.random() * 3)] as any,
  department: ['Engineering', 'Marketing', 'Sales', 'HR'][Math.floor(Math.random() * 4)],
  status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)] as any,
  joinDate: format(
    new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    'yyyy-MM-dd'
  ),
  salary: Math.floor(Math.random() * 100000) + 30000,
  description: `This is a sample description for user ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  address: `Jl. ${['Sudirman', 'Thamrin', 'Gatot Subroto', 'Diponegoro', 'Ahmad Yani', 'Asia Afrika'][Math.floor(Math.random() * 6)]} No. ${Math.floor(Math.random() * 200) + 1}, ${['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Bandung', 'Surabaya', 'Semarang'][Math.floor(Math.random() * 6)]}`,
}));

export const ROLE_OPTIONS = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
  { label: 'Moderator', value: 'moderator' },
];

export const DEPARTMENT_OPTIONS = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
  { label: 'HR', value: 'HR' },
];

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
];
