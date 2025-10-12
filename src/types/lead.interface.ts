export interface ICompany {
    name: string;
    website: string;
    emails?: string[];
    phones?: string[];
}

export interface IContactPerson {
    firstName: string;
    lastName?: string;
    designation?: string;
    emails: string[];
    phones: string[];
}

export interface IActivity {
    outcomeCode:
        | 'connected'
        | 'qualified'
        | 'notQualified'
        | 'callbackScheduled'
        | 'needsDecisionMaker'
        | 'sendInfo'
        | 'negotiation'
        | 'won'
        | 'lost'
        | 'noAnswer'
        | 'voicemailLeft'
        | 'busy'
        | 'switchedOff'
        | 'invalidNumber'
        | 'wrongPerson'
        | 'dnd'
        | 'followUpScheduled'
        | 'followUpOverdue'
        | 'unreachable'
        | 'duplicate'
        | 'archived';

    nextAction?:
        | 'scheduleMeeting'
        | 'sendProposal'
        | 'followUp'
        | 'retry'
        | 'enrichContact'
        | 'markDnc'
        | 'closeLost';

    dueAt?: Date;
    notes?: string;
    lostReason?:
        | 'noBudget'
        | 'notInterested'
        | 'timing'
        | 'competitor'
        | 'other';
    attemptNumber?: number;
    durationSec?: number;
    contactedChannel?: 'phone' | 'sms' | 'whatsapp' | 'email';

    type: 'call' | 'email' | 'note' | 'statusChange';
    content?: string;
    statusFrom?: string;
    statusTo?: string;

    byUser: string;
    at: Date;
    result?: string;
}

export interface ILead {
    _id: string;
    company: ICompany;
    address?: string;
    country: string;
    notes?: string;

    contactPersons: IContactPerson[];

    status:
        | 'new'
        | 'contacted'
        | 'responded'
        | 'qualified'
        | 'meetingScheduled'
        | 'proposal'
        | 'won'
        | 'lost'
        | 'onHold';

    owner: string;
    activities?: IActivity[];
}
