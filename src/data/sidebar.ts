import {
    IconAd2,
    IconFileTypeXls,
    IconLayoutDashboard,
} from '@tabler/icons-react';

export const data = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        access: ['super-admin', 'admin', 'telemarketer', 'lead-generator'],
        icon: IconLayoutDashboard,
    },
    {
        title: 'Leads',
        url: '/leads',
        access: ['admin', 'lead-generator', 'telemarketer'],
        icon: IconFileTypeXls,
    },
    {
        title: 'Tasks',
        url: '/tasks',
        access: ['admin', 'lead-generator', 'telemarketer'],
        icon: IconAd2,
    },
];
