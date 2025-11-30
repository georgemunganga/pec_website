import { QueryCache, QueryClient, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

const getMessageFromError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Something went wrong';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data === undefined) {
        toast.error(getMessageFromError(error));
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.showToast !== false) {
        toast.error(getMessageFromError(error));
      }
    },
  }),
});
