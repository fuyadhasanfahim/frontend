import { apiSlice } from '@/redux/api/apiSlice';
import { ILead } from '@/types/lead.interface';

export const leadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        importLeads: builder.mutation({
            query: (formData) => ({
                url: '/leads/import-leads',
                method: 'POST',
                body: formData,
            }),
        }),
        getLeads: builder.query({
            query: ({
                page,
                limit,
                search,
                status,
                sortBy,
                sortOrder,
                country,
            }) => ({
                url: '/leads/get-leads',
                method: 'GET',
                params: {
                    page,
                    limit,
                    search,
                    status,
                    sortBy,
                    sortOrder,
                    country,
                },
            }),
        }),
        getLeadById: builder.query({
            query: (id: string) => ({
                url: `/leads/get-lead/${id}`,
                method: 'GET',
            }),
            transformResponse: (response: { success: boolean; lead: ILead }) =>
                response.lead,
        }),
        updateLeadByTelemarketer: builder.mutation({
            query: ({
                leadId,
                status,
                note,
            }: {
                leadId: string;
                status?: string;
                note?: string;
            }) => ({
                url: `/leads/${leadId}/status`,
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: { status, note },
            }),
        }),
        newLead: builder.mutation({
            query: (body) => ({
                url: '/leads/new-lead',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            }),
        }),
        updateLeadStatus: builder.mutation({
            query: (body) => ({
                url: '/leads/new-lead',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            }),
        }),
        assignTelemarketer: builder.mutation({
            query: (body) => ({
                url: '/leads/assign-telemarketer',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            }),
        }),
        getAssignments: builder.query({
            query: (userId: string) => ({
                url: `/leads/assignments/${userId}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetLeadsQuery,
    useGetLeadByIdQuery,
    useImportLeadsMutation,
    useNewLeadMutation,
    useAssignTelemarketerMutation,
    useGetAssignmentsQuery,
    useUpdateLeadStatusMutation,
    useUpdateLeadByTelemarketerMutation,
} = leadApi;
