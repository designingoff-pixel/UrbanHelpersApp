import { EventEmitter, NativeModulesProxy, requireNativeModule } from "expo-modules-core";

let StepCounterNativeModule: any = null;
try {
  StepCounterNativeModule = requireNativeModule("ExpoStepCounter");
} catch {
  StepCounterNativeModule = (NativeModulesProxy as any)?.ExpoStepCounter || null;
}

const emitter = StepCounterNativeModule ? new EventEmitter(StepCounterNativeModule) : null;

export interface StepCounterEvent {
  totalSteps: number;
  timestamp: number;
}

export function isNativeStepCounterAvailable(): boolean {
  try {
    return StepCounterNativeModule ? StepCounterNativeModule.isStepCounterAvailable() : false;
  } catch {
    return false;
  }
}

export async function requestStepCounterPermissionsAsync(): Promise<boolean> {
  try {
    if (!StepCounterNativeModule) return false;
    const res = await StepCounterNativeModule.requestPermissionsAsync();
    return typeof res === "boolean" ? res : res?.granted ?? false;
  } catch {
    return false;
  }
}

export function getNativeTotalSensorSteps(): number {
  try {
    return StepCounterNativeModule ? StepCounterNativeModule.getTotalSensorSteps() : 0;
  } catch {
    return 0;
  }
}

export function startNativeStepListening(callback: (event: StepCounterEvent) => void): () => void {
  if (!StepCounterNativeModule || !emitter) {
    return () => {};
  }

  StepCounterNativeModule.startListening();
  const sub = emitter.addListener("onStepCounterChanged", callback);

  return () => {
    sub.remove();
    StepCounterNativeModule.stopListening();
  };
}
