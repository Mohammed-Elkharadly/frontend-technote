import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';

import { apiSlice } from '../../app/api/apiSlice';

const usersAdapter = createEntityAdapter({});

const initialState = usersAdapter.getInitialState();

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: '/users',
        // response: Full Response object from Fetch API (contains status, headers, etc.)
        // result: Parsed body (JSON) from the response, treated as 'data' if validation succeeds
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),
      // A function to manipulate the data returned by a query or mutation.
      transformResponse: (responseData) => {
        // Ensure users is an array
        if (!Array.isArray(responseData)) {
          console.log(
            'expected an array of data not an object or any other data'
          );
          return usersAdapter.setAll(initialState, []);
        }
        // coming data from the server looks like
        const loadedUsers = responseData.map((user) => {
          user.id = user._id; // update to id instead _id
          return user;
        });
        return usersAdapter.setAll(initialState, loadedUsers);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            // if succes it will return keys and values
            { type: 'User', id: 'LIST' },
            ...result.ids.map((id) => ({ type: 'User', id })),
          ];
          // if not it will return just the keys
        } else return [{ type: 'User', id: 'LIST' }];
      },
    }),
    addNewUser: builder.mutation({
      query: (initialUserData) => ({
        url: '/users',
        method: 'POST',
        body: { ...initialUserData },
      }),
      // In addNewUser, invalidatesTags targets the 'LIST' tag,
      // forcing a refresh of the entire user list cache
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation({
      query: (initialUserData) => ({
        url: '/users',
        method: 'PATCH',
        body: { ...initialUserData },
      }),
      // In updateUser, invalidatesTags targets the specific user by ID,
      // refreshing only that user's cache
      invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.id }],
    }),
    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: '/users',
        method: 'DELETE',
        body: { id },
      }),
      // In deleteUser, invalidatesTags targets the specific user by ID,
      // refreshing only that user's cache
      invalidatesTags: (result, error, arg) => [{ type: 'User', id: arg.id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useAddNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;

// return the query result object
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select();

// create memoized selector
const selectUsersData = createSelector(
  selectUsersResult,
  // normalized state object with ids & entities
  // { ids: [...], entities: {} }
  (userResult) => userResult.data
);

export const {
  // return all users as an array, e.g., [{id:1, name:'Ahmed'}, {id:2, ...}]
  selectAll: selectAllUsers,
  // return a single user by id, e.g., selectUserById('1')(state) → {id:1, name:'Ahmed'} or undefined
  selectById: selectUserById,
  // return a list of all ids, e.g., ['1', '2', '3', '4']
  selectIds: selectUserIds,
} = usersAdapter.getSelectors(
  (state) => selectUsersData(state) ?? initialState
);
