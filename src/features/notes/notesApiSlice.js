import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';

import { apiSlice } from '../../app/api/apiSlice';

// createEntityAdapter: A utility from Redux Toolkit that helps manage normalized state for a specific entity type.
// It provides methods to manage collections of items, such as adding, updating, and removing items, while keeping the state structure consistent and efficient.
const notesAdapter = createEntityAdapter({});

// getInitialState: A method provided by createEntityAdapter that returns the initial state structure for the entity collection.
// This state typically includes an array of IDs and an entities object to store the actual items.
const initialState = notesAdapter.getInitialState();

export const notesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query({
      query: () => ({
        url: '/notes',
        // response: Full Response object from Fetch API (contains status, headers, etc.)
        // result: Parsed body (JSON) from the response, treated as 'data' if validation succeeds
        validateStatus: (response, result) => {
          return response.status === 200 && !result.isError;
        },
      }),

      // A function to manipulate the data returned by a query or mutation.
      // : Function to modify response data before caching
      transformResponse: (responseData) => {
        // Ensure notes is an array
        if (!Array.isArray(responseData)) {
          console.log(
            'expected an array of data not an object or any other data'
          );
          return notesAdapter.setAll(initialState, []);
        }
        const loadedNotes = responseData.map((note) => {
          note.id = note._id; // update to id instead _id before returning the note
          return note;
        });
        return notesAdapter.setAll(initialState, loadedNotes);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            // if succes it will return keys and values
            { type: 'Note', id: 'LIST' },
            ...result.ids.map((id) => ({ type: 'Note', id })),
          ];
          // if not it will return just the keys
        } else return [{ type: 'Note', id: 'LIST' }];
      },
    }),
    addNewNote: builder.mutation({
      query: (initialNoteData) => ({
        url: '/notes',
        method: 'POST',
        body: { ...initialNoteData },
      }),
      // In addNewNote, invalidatesTags targets the 'LIST' tag,
      // forcing a refresh of the entire note list cache
      invalidatesTags: [{ type: 'Note', id: 'LIST' }],
    }),
    updateNote: builder.mutation({
      query: (initialNoteData) => ({
        url: '/notes',
        method: 'PATCH',
        body: { ...initialNoteData },
      }),
      // In updateNote, invalidatesTags targets the specific note by ID,
      // refreshing only that note's cache
      invalidatesTags: (result, error, arg) => [{ type: 'Note', id: arg.id }],
    }),
    deleteNote: builder.mutation({
      query: ({ id }) => ({
        url: '/notes',
        method: 'DELETE',
        body: { id },
      }),
      // In deleteNote, invalidatesTags targets the specific note by ID,
      // refreshing only that note's cache
      invalidatesTags: (result, error, arg) => [{ type: 'Note', id: arg.id }],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useAddNewNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApiSlice;

// return the query result object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select();

// create memoized selector
const selectNotesData = createSelector(
  selectNotesResult,
  // normalized state object with ids & entities
  // { ids: [...], entities: {} }
  (noteResult) => noteResult.data
);

export const {
  // return all notes as an array, e.g., [{id:1, text:'some text'}, {id:2, ...}]
  selectAll: selectAllNotes,
  // return a single note by id, e.g., selectNoteById('1')(state) → {id:1, text:'some text'} or undefined
  selectById: selectNoteById,
  // return a list of all ids, e.g., ['1', '2', '3', '4']
  selectIds: selectNoteIds,
} = notesAdapter.getSelectors(
  (state) => selectNotesData(state) ?? initialState
);
