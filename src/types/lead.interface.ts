export interface ILead {
    _id: string;
    companyName: string;
    websiteUrl?: string;
    emails: string[];
    phones: string[];
    address?: string;
    contactPerson: {
        firstName: string;
        lastName: string;
    };
    designation?: string;
    country: string;
    status:
        | 'new'
        | 'contacted'
        | 'responded'
        | 'qualified'
        | 'meeting_scheduled'
        | 'proposal'
        | 'won'
        | 'lost'
        | 'on_hold';
    notes?: string;

    owner: string;
    assignedBy?: string;
    assignedAt?: Date;

    accessList: {
        user: string;
        role: 'owner' | 'editor' | 'viewer';
        grantedBy: string;
        grantedAt: Date;
    }[];

    activities: {
        type: 'call' | 'email' | 'note' | 'status_change';
        content: string;
        byUser: string;
        at: Date;
        result?: string;
        nextActionAt?: Date;
    }[];
}

export type NewLead = Omit<ILead, '_id' | keyof Document> & {
    owner: string;
};
