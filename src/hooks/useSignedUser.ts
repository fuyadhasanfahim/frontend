'use client';

import { RootState } from '../redux/store';
import { useGetSignedUserQuery } from '../redux/features/user/userApi';
import { useSelector } from 'react-redux';
import { IUser } from '@/types/user.interface';

export function useSignedUser() {
    const { isLoading, isFetching, refetch, error } = useGetSignedUserQuery();

    const { user } = useSelector((state: RootState) => state.user);

    return {
        user: user as IUser | null,
        isLoading,
        isFetching,
        refetch,
        error,
    };
}
