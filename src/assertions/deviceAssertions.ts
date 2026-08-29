import { getRunState } from '../device/appState';
import { getOrientation, Orientation } from '../device/orientation';
import { AppRunState, describeAppRunState } from '../types/appState';

export async function expectAppRunStateToBe(expectedState: AppRunState): Promise<void> {
  const actualState = await getRunState();
  if (actualState !== expectedState) {
    throw new Error(
      `Expected the application to be ${describeAppRunState(expectedState)} but it was ${describeAppRunState(actualState)}`,
    );
  }
}

export async function expectOrientationToBe(expectedOrientation: Orientation): Promise<void> {
  const actualOrientation = await getOrientation();
  if (actualOrientation !== expectedOrientation) {
    throw new Error(
      `Expected device orientation to be ${expectedOrientation} but it was ${actualOrientation}`,
    );
  }
}
