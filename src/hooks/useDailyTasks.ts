import { useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { formatLocalDate } from '../services/daily-task.service';
import {
  clearDailyTaskError,
  createDailyTask,
  deleteDailyTaskAttachment,
  fetchMyDailyTasks,
  resetDailyTasks,
  updateDailyTask,
} from '../store/dailyTaskSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { DailyTaskPayload } from '../types/daily-task';

export const useDailyTasks = (historyDays = 3) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();
  const state = useAppSelector((rootState) => rootState.dailyTasks);
  const today = formatLocalDate(new Date());

  const todayTask = useMemo(
    () => state.myTasks.find((task) => task.submissionDate === today) || null,
    [state.myTasks, today]
  );

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) return [];
    return dispatch(fetchMyDailyTasks({ days: historyDays })).unwrap();
  }, [dispatch, historyDays, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      void refresh();
    } else {
      dispatch(resetDailyTasks());
    }
  }, [dispatch, isAuthenticated, refresh, user]);

  const save = useCallback(
    async (payload: DailyTaskPayload, files: File[] = []) => {
      if (todayTask) {
        return dispatch(
          updateDailyTask({
            taskId: todayTask.dailyTaskSubmissionId,
            payload,
            files,
          })
        ).unwrap();
      }

      return dispatch(createDailyTask({ payload, files })).unwrap();
    },
    [dispatch, todayTask]
  );

  const removeAttachment = useCallback(
    async (taskId: string, attachmentId: string) => {
      return dispatch(
        deleteDailyTaskAttachment({ taskId, attachmentId })
      ).unwrap();
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearDailyTaskError());
  }, [dispatch]);

  return {
    ...state,
    today,
    todayTask,
    refresh,
    save,
    removeAttachment,
    clearError,
  };
};
