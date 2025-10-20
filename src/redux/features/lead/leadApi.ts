import { apiSlice } from '@/redux/api/apiSlice';

export const leadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        importLeads: builder.mutation({
            query: (formData) => ({
                url: '/leads/import-leads',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Leads'],
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
                outcome,
                date,
                selectedUserId,
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
                    outcome,
                    date,
                    selectedUserId,
                },
            }),
            providesTags: ['Leads'],
        }),
        getLeadsByDate: builder.query({
            query: ({ page, limit, date }) => ({
                url: '/leads/get-leads-by-date',
                method: 'GET',
                params: {
                    page,
                    limit,
                    date,
                },
            }),
            providesTags: ['Leads'],
        }),
        getLeadById: builder.query({
            query: (id: string) => ({
                url: `/leads/get-lead/${id}`,
                method: 'GET',
            }),
            providesTags: ['Leads'],
        }),
        newLead: builder.mutation({
            query: (body) => ({
                url: '/leads/new-lead',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
            }),
            invalidatesTags: ['Leads'],
        }),
        updateLead: builder.mutation({
            query: ({ id, body }) => ({
                url: `/leads/update-lead/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Leads'],
        }),
    }),
});

export const {
    useGetLeadsQuery,
    useGetLeadsByDateQuery,
    useGetLeadByIdQuery,
    useImportLeadsMutation,
    useNewLeadMutation,
    useUpdateLeadMutation,
} = leadApi;
