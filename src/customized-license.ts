import { IResolver, License } from "projen";
import { TypeScriptProject } from "projen/lib/typescript";

const SPDX = "MPL-2.0";

export class CustomizedLicense extends License {
  private year: number;

  constructor(project: TypeScriptProject, overrideYear?: number) {
    super(project, { spdx: SPDX });

    this.year = overrideYear ?? new Date().getFullYear();

    project.addFields({ license: SPDX });
  }

  synthesizeContent(resolver: IResolver) {
    return (
      `Copyright (c) ${this.year} HashiCorp, Inc.\n\n` +
      super.synthesizeContent(resolver)
    );
  }
}
