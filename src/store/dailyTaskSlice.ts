import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  dailyTaskService,
  getRecentDateKeys,
} from '../services/daily-task.service';
import {
  DailyTask,
  DailyTaskListQuery,
  DailyTaskPayload,
} from '../types/daily-task';

interface DailyTaskState {
  myTasks: DailyTask[];
  reviewTasks: DailyTask[];
  reviewDate: string | null;
  isLoadingMine: boolean;
  isLoadingReview: boolean;
  isSaving: boolean;
  deletingAttachmentId: string | null;
  error: string | null;
}

interface SaveTaskArgs {
  payload: DailyTaskPayload;
  files?: File[];
}

interface UpdateTaskArgs extends SaveTaskArgs {
  taskId: string;
}

interface DeleteAttachmentArgs {
  taskId: string;
  attachmentId: string;
}

const initialState: DailyTaskState = {
  myTasks: [],
  reviewTasks: [],
  reviewDate: null,
  isLoadingMine: false,
  isLoadingReview: false,
  isSaving: false,
  deletingAttachmentId: null,
  error: null,
};

const getErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<{
    message?: string;
    errors?: { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
  }>;

  return (
    axiosError.response?.data?.message ||
    axiosError.message ||
    'The Daily Task request failed'
  );
};

const upsertTask = (tasks: DailyTask[], task: DailyTask): DailyTask[] => {
  const nextTasks = tasks.filter(
    (item) => item.dailyTaskSubmissionId !== task.dailyTaskSubmissionId
  );
  nextTasks.push(task);
  return nextTasks.sort(
    (a, b) => Number(b.submittedAtEpoch) - Number(a.submittedAtEpoch)
  );
};

export const fetchMyDailyTasks = createAsyncThunk<
  DailyTask[],
  { days?: number },
  { rejectValue: string }
>('dailyTasks/fetchMine', async ({ days = 3 }, { rejectWithValue }) => {
  try {
    return await dailyTaskService.getMineForDates(getRecentDateKeys(days));
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchDailyTasksForReview = createAsyncThunk<
  { date: string; tasks: DailyTask[] },
  DailyTaskListQuery,
  { rejectValue: string }
>('dailyTasks/fetchForReview', async (query, { rejectWithValue }) => {
  try {
    const response = await dailyTaskService.getForReview(query);
    return { date: response.date, tasks: response.dailyTasks };
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createDailyTask = createAsyncThunk<
  DailyTask,
  SaveTaskArgs,
  { rejectValue: string }
>('dailyTasks/create', async ({ payload, files = [] }, { rejectWithValue }) => {
  try {
    let task = await dailyTaskService.create(payload);
    if (files.length) {
      task = await dailyTaskService.uploadAttachments(
        task.dailyTaskSubmissionId,
        files
      );
    }
    return task;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateDailyTask = createAsyncThunk<
  DailyTask,
  UpdateTaskArgs,
  { rejectValue: string }
>(
  'dailyTasks/update',
  async ({ taskId, payload, files = [] }, { rejectWithValue }) => {
    try {
      let task = await dailyTaskService.update(taskId, payload);
      if (files.length) {
        task = await dailyTaskService.uploadAttachments(taskId, files);
      }
      return task;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteDailyTaskAttachment = createAsyncThunk<
  DeleteAttachmentArgs,
  DeleteAttachmentArgs,
  { rejectValue: string }
>(
  'dailyTasks/deleteAttachment',
  async (args, { rejectWithValue }) => {
    try {
      await dailyTaskService.deleteAttachment(args.taskId, args.attachmentId);
      return args;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const dailyTaskSlice = createSlice({
  name: 'dailyTasks',
  initialState,
  reducers: {
    clearDailyTaskError: (state) => {
      state.error = null;
    },
    resetDailyTasks: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyDailyTasks.pending, (state) => {
        state.isLoadingMine = true;
        state.error = null;
      })
      .addCase(fetchMyDailyTasks.fulfilled, (state, action) => {
        state.isLoadingMine = false;
        state.myTasks = action.payload;
      })
      .addCase(fetchMyDailyTasks.rejected, (state, action) => {
        state.isLoadingMine = false;
        state.error = action.payload || 'Failed to fetch your daily tasks';
      })
      .addCase(fetchDailyTasksForReview.pending, (state) => {
        state.isLoadingReview = true;
        state.error = null;
      })
      .addCase(fetchDailyTasksForReview.fulfilled, (state, action) => {
        state.isLoadingReview = false;
        state.reviewDate = action.payload.date;
        state.reviewTasks = action.payload.tasks;
      })
      .addCase(fetchDailyTasksForReview.rejected, (state, action) => {
        state.isLoadingReview = false;
        state.error = action.payload || 'Failed to fetch daily tasks';
      })
      .addCase(createDailyTask.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createDailyTask.fulfilled, (state, action) => {
        state.isSaving = false;
        state.myTasks = upsertTask(state.myTasks, action.payload);
      })
      .addCase(createDailyTask.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to submit the daily task';
      })
      .addCase(updateDailyTask.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateDailyTask.fulfilled, (state, action) => {
        state.isSaving = false;
        state.myTasks = upsertTask(state.myTasks, action.payload);
      })
      .addCase(updateDailyTask.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to update the daily task';
      })
      .addCase(deleteDailyTaskAttachment.pending, (state, action) => {
        state.deletingAttachmentId = action.meta.arg.attachmentId;
        state.error = null;
      })
      .addCase(deleteDailyTaskAttachment.fulfilled, (state, action) => {
        state.deletingAttachmentId = null;
        const removeAttachment = (task: DailyTask) => {
          if (task.dailyTaskSubmissionId === action.payload.taskId) {
            task.attachments = task.attachments.filter(
              (attachment) =>
                attachment.dailyTaskAttachmentId !==
                action.payload.attachmentId
            );
          }
        };
        state.myTasks.forEach(removeAttachment);
        state.reviewTasks.forEach(removeAttachment);
      })
      .addCase(deleteDailyTaskAttachment.rejected, (state, action) => {
        state.deletingAttachmentId = null;
        state.error = action.payload || 'Failed to delete the attachment';
      });
  },
});

export const { clearDailyTaskError, resetDailyTasks } =
  dailyTaskSlice.actions;

export default dailyTaskSlice.reducer;
