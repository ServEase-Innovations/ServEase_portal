import { configureStore } from '@reduxjs/toolkit';
import dailyTaskReducer from './dailyTaskSlice';

export const store = configureStore({
  reducer: {
    dailyTasks: dailyTaskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.arg.files'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
