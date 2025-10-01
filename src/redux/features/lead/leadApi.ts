import { apiSlice } from '@/redux/api/apiSlice';

export const leadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        importLeads: builder.mutation<
            {
                success: boolean;
                inserted: number;
                skipped?: number;
                errors?: number;
            }, // Response type
            FormData // Request type
        >({
            query: (formData) => ({
                url: '/leads/import',
                method: 'POST',
                body: formData,
            }),
        }),

        getLeads: builder.query<any[], void>({
            query: () => ({
                url: '/leads/get-leads',
                method: 'GET',
            }),
        }),
    }),
});

export const { useImportLeadsMutation, useGetLeadsQuery } = leadApi;
