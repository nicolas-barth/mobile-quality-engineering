import { loadEnv } from '../../config/env';

export function byResourceId(id: string): string {
  const env = loadEnv();
  return `android=new UiSelector().resourceId("${env.androidAppPackage}:id/${id}")`;
}

export function byResourceIdAndText(id: string, text: string): string {
  const env = loadEnv();
  return `android=new UiSelector().resourceId("${env.androidAppPackage}:id/${id}").text("${text}")`;
}

export function byExactText(text: string): string {
  return `android=new UiSelector().text("${text}")`;
}

export function byDescriptionAndText(description: string, text: string): string {
  return `android=new UiSelector().description("${description}").text("${text}")`;
}
