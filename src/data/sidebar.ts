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
        access: ['admin', 'user', 'lead-generator'],
        icon: IconFileTypeXls,
    },
    {
        title: 'Telemarketing',
        url: '/telemarketing',
        access: ['admin', 'user', 'telemarketer'],
        icon: IconAd2,
    },
];
