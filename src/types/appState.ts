export enum AppRunState {
  NotRunning = 1,
  RunningInBackgroundSuspended = 2,
  RunningInBackground = 3,
  RunningInForeground = 4,
}

export function describeAppRunState(state: AppRunState): string {
  switch (state) {
    case AppRunState.NotRunning:
      return 'not running';
    case AppRunState.RunningInBackgroundSuspended:
      return 'running in background (suspended)';
    case AppRunState.RunningInBackground:
      return 'running in background';
    case AppRunState.RunningInForeground:
      return 'running in foreground';
  }
}
