import type { QueryClient } from '@tanstack/react-query';

export function invalidateAfterOfferMutation(queryClient: QueryClient, processId: number | string) {
  void queryClient.invalidateQueries({ queryKey: ['interview-process', String(processId), 'offer'] });
  void queryClient.invalidateQueries({ queryKey: ['interview-process', String(processId)] });
  void queryClient.invalidateQueries({ queryKey: ['interview-processes'] });
  void queryClient.invalidateQueries({ queryKey: ['matches'] });
}

export function invalidateAfterOnboardMutation(queryClient: QueryClient, processId: number | string) {
  void queryClient.invalidateQueries({ queryKey: ['interview-process', String(processId), 'onboard'] });
  void queryClient.invalidateQueries({ queryKey: ['interview-process', String(processId)] });
  void queryClient.invalidateQueries({ queryKey: ['interview-processes'] });
  void queryClient.invalidateQueries({ queryKey: ['matches'] });
}
