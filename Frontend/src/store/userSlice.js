import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    userId: null,
    name: '',
    email: '',
    role: '',
    status: '',
    createdAt: null,
    isLoading: true
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserDetail: (state, action) => {
            if (action.payload) {
                state.userId = action.payload.id || action.payload.userId
                state.name = action.payload.name
                state.email = action.payload.email
                state.role = action.payload.role
                state.status = action.payload.status
                state.createdAt = action.payload.createdAt
            }
            state.isLoading = false
        },
        clearUserDetail: (state) => {
            state.userId = null
            state.name = ''
            state.email = ''
            state.role = ''
            state.status = ''
            state.createdAt = null
            state.isLoading = false
        }
    }
})

export const { setUserDetail, clearUserDetail } = userSlice.actions

export default userSlice.reducer
