export type DemoUserStatus = 'standard' | 'lockedOut' | 'visual';

export interface DemoUser {
  username: string;
  password: string;
  status: DemoUserStatus;
}
