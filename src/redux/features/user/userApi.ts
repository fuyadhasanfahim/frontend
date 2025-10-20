import { apiSlice } from '@/redux/api/apiSlice';
import { setUser, clearUser } from './userSlice';
import { IUser } from '@/types/user.interface';

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
        updateUser: builder.mutation<UserResponse, Partial<IUser>>({
            query: (user) => ({
                url: '/users/update-user',
                method: 'PUT',
                body: user,
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
        getAllUsers: builder.query({
            query: ({ role }) => ({
                url: `/users/get-all-users`,
                method: 'GET',
                params: {
                    role,
                },
            }),
        }),
        updatePassword: builder.mutation({
            query: (data) => ({
                url: '/users/update-password',
                method: 'PUT',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetSignedUserQuery,
    useGetAllUsersQuery,
    useUpdateUserMutation,
    useUpdatePasswordMutation,
} = userApi;
