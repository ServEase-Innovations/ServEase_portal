import {
  useCallback,
} from 'react';

import {
  clearDailyTaskError,
  fetchDailyTasksForReview,
} from '../store/dailyTaskSlice';

import {
  useAppDispatch,
  useAppSelector,
} from '../store/hooks';

import type {
  DailyTask,
  DailyTaskListQuery,
} from '../types/daily-task';

interface ReviewLoadResult {
  date: string;
  tasks: DailyTask[];
}

interface UseDailyTaskReviewReturn {
  tasks: DailyTask[];
  date: string | null;
  isLoading: boolean;
  error: string | null;

  load: (
    query: DailyTaskListQuery
  ) => Promise<ReviewLoadResult>;

  clearError: () => void;
}

export const useDailyTaskReview =
  (): UseDailyTaskReviewReturn => {
    const dispatch = useAppDispatch();

    /*
     * rootState is automatically typed as RootState.
     */
    const dailyTaskState = useAppSelector(
      (rootState) =>
        rootState.dailyTasks
    );

    /*
     * Explicitly provide the DailyTask array type.
     */
    const tasks: DailyTask[] =
      Array.isArray(
        dailyTaskState.reviewTasks
      )
        ? (
            dailyTaskState.reviewTasks as DailyTask[]
          )
        : [];

    const load = useCallback(
      async (
        query: DailyTaskListQuery
      ): Promise<ReviewLoadResult> => {
        const result = await dispatch(
          fetchDailyTasksForReview(query)
        ).unwrap();

        return {
          date: result.date,
          tasks: result.tasks,
        };
      },
      [dispatch]
    );

    const clearError =
      useCallback((): void => {
        dispatch(
          clearDailyTaskError()
        );
      }, [dispatch]);

    return {
      tasks,
      date:
        dailyTaskState.reviewDate ??
        null,
      isLoading:
        dailyTaskState.isLoadingReview,
      error:
        dailyTaskState.error ??
        null,
      load,
      clearError,
    };
  };