'use client';

import { RootState } from '../redux/store';
import { useGetSignedUserQuery } from '../redux/features/user/userApi';
import { useSelector } from 'react-redux';

export function useSignedUser() {
    const { isLoading, isFetching, refetch, error } = useGetSignedUserQuery();

    const { user } = useSelector((state: RootState) => state.user);

    return {
        user: user ?? null,
        isLoading,
        isFetching,
        refetch,
        error,
    };
}
