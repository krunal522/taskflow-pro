// ============================================
// ROOT REDUCER — Combines all slice reducers
// ============================================

import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice';
import taskReducer from '../features/dashboard/store/taskSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: taskReducer,
});

export default rootReducer;
