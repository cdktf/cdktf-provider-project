import { IResolver, License } from "projen";
import { TypeScriptProject } from "projen/lib/typescript";

const SPDX = "MPL-2.0";

export class CustomizedLicense extends License {
  private year: number;
  private licensee: string;

  constructor(
    project: TypeScriptProject,
    overrideYear?: number,
    overrideLicensee?: string
  ) {
    super(project, { spdx: SPDX });

    this.year = overrideYear ?? new Date().getFullYear();
    this.licensee = overrideLicensee ?? "HashiCorp, Inc.";

    project.addFields({ license: SPDX });
  }

  synthesizeContent(resolver: IResolver) {
    return (
      `Copyright (c) ${this.year} ${this.licensee}\n\n` +
      super.synthesizeContent(resolver)
    );
  }
}
