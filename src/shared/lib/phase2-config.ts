export function getMatchPipelineStatus(match: { pipelineStatus?: string }): import('@/shared/types/api').PipelineStatus {
  return (match.pipelineStatus as import('@/shared/types/api').PipelineStatus) ?? 'NONE';
}

/** Match chưa có process — cho phép Start Interview trên Matching CV */
export function canStartInterview(match: {
  processId?: number | null;
  pipelineStatus?: string;
}): boolean {
  if (match.processId != null) return false;
  return getMatchPipelineStatus(match) === 'NONE';
}

/** @deprecated Dùng `canStartInterview` */
export const canCreateInterviewProcess = canStartInterview;
