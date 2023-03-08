/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { cdk } from "projen";

export interface PackageInfo {
  npm: {
    name: string;
  };
  python: NonNullable<cdk.JsiiProjectOptions["python"]>;
  publishToNuget: NonNullable<cdk.JsiiProjectOptions["publishToNuget"]>;
  publishToMaven: NonNullable<cdk.JsiiProjectOptions["publishToMaven"]>;
  publishToGo: cdk.JsiiProjectOptions["publishToGo"];
}
