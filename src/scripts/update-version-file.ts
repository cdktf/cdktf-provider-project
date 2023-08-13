/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { FileBase, FileBaseOptions, IResolver } from "projen";
import { NodeProject } from "projen/lib/javascript";

// whats needed here to update file??
// underlying provider version, prebuilt provider version, current cdktf version (im guessing, tho can imagine how itd be different)
export interface UpdateVersionFileOptions extends FileBaseOptions {
  underlyingTerraformProviderVersion: string;
  prebuiltProviderVersion: string;
  cdktfVersion: string;
}

export class UpdateVersionFile extends FileBase {
  protected readonly options: UpdateVersionFileOptions;

  constructor(project: NodeProject, options: UpdateVersionFileOptions) {
    super(project, "scripts/update-version-file.js", options);
    this.options = options;

    project.addDevDeps("fs");
  }

  protected synthesizeContent(resolver: IResolver): string | undefined {
    let {
      underlyingTerraformProviderVersion,
      prebuiltProviderVersion,
      cdktfVersion,
    } = resolver.resolve(this.options) as UpdateVersionFileOptions;

    return `
/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */
const fs = require("fs")
// set by the projen file that generates this script
const TERRAFORM_PROVIDER_VERSION = "${underlyingTerraformProviderVersion}" 
const CDKTF_VERSION = "${cdktfVersion}" 
const PREBUILT_PROVIDER_VERSION = "${prebuiltProviderVersion}" 
const SEPARATOR = "| --- | --- | --- |\n"

(function main() {
    if (!fs.existsSync("VERSIONS_COMPATIBILITY.md")) {
        const header = \`| Prebuilt Provider Version | Terraform Provider Version | CDKTF Version |\n\${ separator }\`
        fs.writeFileSync("VERSIONS.md", header)
    }

    // read file contents
    const text = fs.readFileSync("VERSIONS_COMPATIBILITY.md", "utf8")
    // split on separator - between header and entries
    const parts = text.split(separator)
    const header = parts[0]
    // split leads to empty space when no entries are present
    const oldEntries = parts[1] === " " ? '' : parts[1]
    const newVersionEntry = \`| \${ PREBUILT_PROVIDER_VERSION }  | \${ TERRAFORM_PROVIDER_VERSION } | \${ CDKTF_VERSION } |\n\`;
    fs.writeFileSync("VERSIONS_COMPATIBILITY.md", header + separator + newVersionEntry + oldEntries)
})();            
`;
  }
}
