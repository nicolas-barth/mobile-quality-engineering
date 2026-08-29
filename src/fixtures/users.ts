import { DemoUser } from '../types/user';

const DEMO_PASSWORD = '10203040';

export const standardUser: DemoUser = {
  username: 'bod@example.com',
  password: DEMO_PASSWORD,
  status: 'standard',
};

export const lockedOutUser: DemoUser = {
  username: 'alice@example.com',
  password: DEMO_PASSWORD,
  status: 'lockedOut',
};

export const visualUser: DemoUser = {
  username: 'visual@example.com',
  password: DEMO_PASSWORD,
  status: 'visual',
};
