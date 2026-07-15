import api from './api';
import {
  DailyTask,
  DailyTaskListQuery,
  DailyTaskListResponse,
  DailyTaskMutationResponse,
  DailyTaskPayload,
} from '../types/daily-task';

export const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getRecentDateKeys = (days: number): string[] => {
  const safeDays = Math.max(1, Math.min(days, 31));

  return Array.from({ length: safeDays }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - index);
    return formatLocalDate(date);
  });
};

export const dailyTaskService = {
  getMine: async (date: string): Promise<DailyTaskListResponse> => {
    const response = await api.get<DailyTaskListResponse>('/daily-tasks/mine', {
      params: { date },
    });
    return response.data;
  },

  getMineForDates: async (dates: string[]): Promise<DailyTask[]> => {
    const responses = await Promise.all(
      dates.map((date) => dailyTaskService.getMine(date))
    );

    return responses
      .flatMap((response) => response.dailyTasks)
      .sort(
        (a, b) =>
          Number(b.submittedAtEpoch) - Number(a.submittedAtEpoch)
      );
  },

  getForReview: async (
    query: DailyTaskListQuery
  ): Promise<DailyTaskListResponse> => {
    const response = await api.get<DailyTaskListResponse>('/daily-tasks', {
      params: query,
    });
    return response.data;
  },

  getById: async (id: string): Promise<DailyTask> => {
    const response = await api.get<{ dailyTask: DailyTask }>(
      `/daily-tasks/${id}`
    );
    return response.data.dailyTask;
  },

  create: async (payload: DailyTaskPayload): Promise<DailyTask> => {
    const response = await api.post<DailyTaskMutationResponse>(
      '/daily-tasks',
      payload
    );
    return response.data.dailyTask;
  },

  update: async (
    id: string,
    payload: DailyTaskPayload
  ): Promise<DailyTask> => {
    const response = await api.patch<DailyTaskMutationResponse>(
      `/daily-tasks/${id}`,
      payload
    );
    return response.data.dailyTask;
  },

  uploadAttachments: async (
    taskId: string,
    files: File[]
  ): Promise<DailyTask> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post<DailyTaskMutationResponse>(
      `/daily-tasks/${taskId}/attachments`,
      formData
    );
    return response.data.dailyTask;
  },

  deleteAttachment: async (
    taskId: string,
    attachmentId: string
  ): Promise<void> => {
    await api.delete(
      `/daily-tasks/${taskId}/attachments/${attachmentId}`
    );
  },
};
