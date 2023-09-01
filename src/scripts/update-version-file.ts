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
  cdktfVersion: string;
}

export class UpdateVersionFile extends FileBase {
  protected readonly options: UpdateVersionFileOptions;

  constructor(project: NodeProject, options: UpdateVersionFileOptions) {
    super(project, "scripts/update-version-file.js", options);
    this.options = options;

    project.addDevDeps("fs");
    project.addDevDeps("path");
  }

  protected synthesizeContent(resolver: IResolver): string | undefined {
    let { underlyingTerraformProviderVersion, cdktfVersion } = resolver.resolve(
      this.options
    ) as UpdateVersionFileOptions;

    return `
/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */
(function main() {
    const fs = require("fs")
    const path = require("path")
    // set by the projen file that generates this script
    const TERRAFORM_PROVIDER_VERSION = "${underlyingTerraformProviderVersion}"
    const CDKTF_VERSION = "${cdktfVersion}"
    const filePath = path.join(__dirname, "../dist/dist/version.txt")
    const PREBUILT_PROVIDER_VERSION = fs.readFileSync(filePath, "utf8")
    const SEPARATOR = \`| --- | --- | --- |\\n\`
    if (!fs.existsSync("VERSIONS_COMPATIBILITY.md")) {
        const header = \`| Prebuilt Provider Version | Terraform Provider Version | CDKTF Version |\\n\${SEPARATOR}\`
        fs.writeFileSync("VERSIONS_COMPATIBILITY.md", header)
    }
    const text = fs.readFileSync("VERSIONS_COMPATIBILITY.md", "utf8")
    const parts = text.split(SEPARATOR)
    const header = parts[0]
    const oldEntries = parts[1]
    const newVersionEntry = \`| \${PREBUILT_PROVIDER_VERSION} | \${TERRAFORM_PROVIDER_VERSION} | \${CDKTF_VERSION} |\`;
    // suboptimal, but only way to tell at this point in the build workflow if the there has actually been a provider/cdktf upgrade done
    const isNewEntry = !oldEntries.split("\\n").some((entry) => {
        return (entry === newVersionEntry)
    });
    if (isNewEntry) {
        fs.writeFileSync("VERSIONS_COMPATIBILITY.md", \`\${header}\${SEPARATOR}\${newVersionEntry}\\n\${oldEntries}\`)
    }
})();    
`;
  }
}
