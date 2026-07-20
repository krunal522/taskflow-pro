// ============================================
// TASK SLICE — Redux state for tasks
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { taskAPI } from '../../../api/user.api';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus, TaskStats, LoadingState } from '../../../types/common.types';

interface TaskState {
  tasks: Task[];
  stats: TaskStats;
  status: LoadingState;
  error: string | null;
  filters: {
    status: string;
    priority: string;
    search: string;
  };
}

const initialState: TaskState = {
  tasks: [],
  stats: { total: 0, todo: 0, inprogress: 0, done: 0, highPriority: 0 },
  status: 'idle',
  error: null,
  filters: { status: 'all', priority: 'all', search: '' },
};

// Async Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params: Record<string, string> | undefined, { rejectWithValue }) => {
    try {
      const { data } = await taskAPI.getAll(params);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (payload: CreateTaskPayload, { rejectWithValue }) => {
    try {
      const { data } = await taskAPI.create(payload);
      return data.task as Task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: string; data: UpdateTaskPayload }, { rejectWithValue }) => {
    try {
      const res = await taskAPI.update(id, data);
      return res.data.task as Task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update task');
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }: { id: string; status: TaskStatus }, { rejectWithValue }) => {
    try {
      const { data } = await taskAPI.updateStatus(id, status);
      return data.task as Task;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskAPI.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
    }
  }
);

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<TaskState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: 'all', priority: 'all', search: '' };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (s) => { s.status = 'loading'; })
      .addCase(fetchTasks.fulfilled, (s, a: any) => {
        s.status = 'succeeded';
        s.tasks = a.payload.tasks;
        s.stats = a.payload.stats;
      })
      .addCase(fetchTasks.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload as string;
      })
      // createTask
      .addCase(createTask.fulfilled, (s, a) => {
        s.tasks.unshift(a.payload);
        s.stats.total += 1;
        s.stats[a.payload.status as keyof TaskStats]++;
      })
      // updateTask
      .addCase(updateTask.fulfilled, (s, a) => {
        const idx = s.tasks.findIndex(t => t._id === a.payload._id);
        if (idx !== -1) s.tasks[idx] = a.payload;
      })
      // updateTaskStatus
      .addCase(updateTaskStatus.fulfilled, (s, a) => {
        const idx = s.tasks.findIndex(t => t._id === a.payload._id);
        if (idx !== -1) s.tasks[idx] = a.payload;
      })
      // deleteTask
      .addCase(deleteTask.fulfilled, (s, a) => {
        const task = s.tasks.find(t => t._id === a.payload);
        if (task) {
          s.stats.total = Math.max(0, s.stats.total - 1);
          s.stats[task.status as keyof TaskStats] = Math.max(0, (s.stats[task.status as keyof TaskStats] as number) - 1);
        }
        s.tasks = s.tasks.filter(t => t._id !== a.payload);
      });
  },
});

export const { setFilter, clearFilters } = taskSlice.actions;
export default taskSlice.reducer;

// Selectors
export const selectTasks = (state: { tasks: TaskState }) => state.tasks.tasks;
export const selectTaskStats = (state: { tasks: TaskState }) => state.tasks.stats;
export const selectTaskStatus = (state: { tasks: TaskState }) => state.tasks.status;
export const selectFilters = (state: { tasks: TaskState }) => state.tasks.filters;
