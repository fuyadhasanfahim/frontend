import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    image: string;
    role: string;

    resetPasswordToken?: string;
    resetPasswordExpiry: Date;

    teamId: string;

    isActive: boolean;
    lastLogin: Date;

    createdAt: Date;
    updatedAt: Date;
}

interface UserState {
    user: IUser | null;
}

const initialState: UserState = {
    user: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<IUser | null>) => {
            state.user = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
