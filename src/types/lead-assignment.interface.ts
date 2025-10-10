import { ILead } from './lead.interface';

export interface ILeadAssignment {
    _id: string;
    telemarketer: string;
    assignedBy: string;
    leads: ILead[];
    totalTarget?: number;
    deadline?: Date;
    createdAt: Date;
    updatedAt: Date;

    completedCount: number;
    completedLeads: string[];
    status: 'active' | 'completed' | 'expired';
}
