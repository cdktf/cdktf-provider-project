/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { validateWorkflow } from "@action-validator/core";
import { GithubWorkflow } from "projen/lib/github";
import { synthSnapshot } from "./util/synth";
import { getProject } from "./util/test-project";

const project = getProject();

describe("GitHub Actions validation", () => {
  const snapshot = synthSnapshot(getProject());

  project.github!.workflows.forEach((workflow: GithubWorkflow) => {
    test(workflow.file!.path, () => {
      const state = validateWorkflow(snapshot[workflow.file!.path]);

      expect(state.errors).toEqual([]);
    });
  });
});
