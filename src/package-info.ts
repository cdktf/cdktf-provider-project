import { cdk } from 'projen';

export interface PackageInfo {
  npm: {
    name: string;
  };
  python: cdk.JsiiProjectOptions['python'];
  publishToNuget: cdk.JsiiProjectOptions['publishToNuget'];
  publishToMaven: cdk.JsiiProjectOptions['publishToMaven'];
}
