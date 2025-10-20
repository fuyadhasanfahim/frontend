import { apiSlice } from '@/redux/api/apiSlice';

export const taskApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createTask: builder.mutation({
            query: (data) => ({
                url: '/tasks/create-task',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Tasks'],
        }),
        getTasks: builder.query({
            query: ({ page, limit, selectedUserId }) => ({
                url: '/tasks/get-tasks',
                params: {
                    page,
                    limit,
                    selectedUserId,
                },
            }),
            providesTags: ['Tasks'],
        }),
        getTaskById: builder.query({
            query: (id) => `/tasks/get-task/${id}`,
            providesTags: ['Tasks'],
        }),
        updateTaskWithLead: builder.mutation({
            query: ({ taskId, leadId, body }) => ({
                url: `/tasks/update-task-with-lead/${taskId}/${leadId}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Tasks'],
        }),
    }),
});

export const {
    useCreateTaskMutation,
    useGetTasksQuery,
    useGetTaskByIdQuery,
    useUpdateTaskWithLeadMutation,
} = taskApi;
