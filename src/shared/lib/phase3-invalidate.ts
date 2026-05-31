import type { QueryClient } from '@tanstack/react-query';

/** Invalidate caches sau mutation Phase 3 (api-contract §11) */
export function invalidateAfterScheduleMutation(queryClient: QueryClient, processId?: number | string) {
  void queryClient.invalidateQueries({ queryKey: ['interview-schedules'] });
  void queryClient.invalidateQueries({ queryKey: ['interview-processes'] });
  void queryClient.invalidateQueries({ queryKey: ['matches'] });
  if (processId != null) {
    void queryClient.invalidateQueries({ queryKey: ['interview-process', String(processId)] });
    void queryClient.invalidateQueries({
      queryKey: ['interview-process', String(processId), 'schedules'],
    });
  }
}

export function invalidateAfterInterviewResult(queryClient: QueryClient, processId: number | string) {
  invalidateAfterScheduleMutation(queryClient, processId);
}
