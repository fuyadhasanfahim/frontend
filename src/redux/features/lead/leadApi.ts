import { apiSlice } from '@/redux/api/apiSlice';

type ImportResponse = {
    success: boolean;
    message: string;
    uploadId: string;
    inserted: number;
    duplicates: number;
    errors: number;
    total: number;
};

export const leadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        importLeads: builder.mutation<ImportResponse, FormData>({
            query: (formData) => ({
                url: '/leads/import-leads',
                method: 'POST',
                body: formData,
            }),
        }),
    }),
});

export const { useImportLeadsMutation } = leadApi;
