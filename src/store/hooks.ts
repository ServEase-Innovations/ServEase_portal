import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';

import type {
  AppDispatch,
  RootState,
} from './store';

export const useAppDispatch = (): AppDispatch => {
  return useDispatch<AppDispatch>();
};

export const useAppSelector: TypedUseSelectorHook<RootState> =
  useSelector;