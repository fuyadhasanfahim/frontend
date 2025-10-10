import { apiSlice } from '@/redux/api/apiSlice';

export interface ICountry {
    name: string;
    _id: string;
}

export const countryApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCountries: builder.query({
            query: () => ({
                url: '/countries/get-countries',
                method: 'GET',
            }),
            transformResponse: (response: {
                success: boolean;
                data: ICountry[];
            }) => response.data,
        }),

        addCountry: builder.mutation({
            query: (body: { name: string }) => ({
                url: '/countries/new-country',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const { useGetCountriesQuery, useAddCountryMutation } = countryApi;
