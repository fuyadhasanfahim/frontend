import { apiSlice } from '@/redux/api/apiSlice';
import { setUser, clearUser, IUser } from './userSlice';

interface UserResponse {
    success: boolean;
    user: IUser;
}

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSignedUser: builder.query<UserResponse, void>({
            query: () => ({
                url: '/users/get-signed-user',
                method: 'GET',
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    if (data?.success && data.user) {
                        dispatch(setUser(data.user));
                    }
                } catch {
                    dispatch(clearUser());
                }
            },
        }),
    }),
});

export const { useGetSignedUserQuery } = userApi;
