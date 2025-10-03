import { apiSlice } from '@/redux/api/apiSlice';

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
    }),
});

export const { useGetLeadsQuery, useImportLeadsMutation } = leadApi;
