/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { FileBase, FileBaseOptions, IResolver, Project } from "projen";
import { PackageInfo } from "./package-info";

export interface ReadmeFileOptions extends FileBaseOptions {
  providerName: string;
  fqproviderName: string;
  providerVersion: string;
  packageInfo: PackageInfo;
  underlyingTerraformVersion: string;
  cdktfVersion: string;
  isDeprecated: boolean;
  deprecationDate?: string;
}

export class ReadmeFile extends FileBase {
  protected readonly options: ReadmeFileOptions;

  constructor(project: Project, filePath: string, options: ReadmeFileOptions) {
    super(project, filePath, options);
    this.options = options;
  }

  protected synthesizeContent(resolver: IResolver) {
    const {
      providerName,
      fqproviderName,
      providerVersion,
      packageInfo,
      underlyingTerraformVersion,
      isDeprecated,
      deprecationDate,
    } = resolver.resolve(this.options) as ReadmeFileOptions;

    const fqpnURL = fqproviderName.includes("/")
      ? fqproviderName
      : `hashicorp/${fqproviderName}`;
    const versionURL = providerVersion
      ? providerVersion.replace(/~>\s*/, "").concat(".0")
      : "";
    const registryUrl = `https://registry.terraform.io/providers/${fqpnURL}/${
      underlyingTerraformVersion !== "<unknown>"
        ? underlyingTerraformVersion
        : versionURL
    }`;
    const cdktfVersion = this.options.cdktfVersion.replace("^", "");

    const date =
      deprecationDate ??
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    const deprecationMessage = `
HashiCorp made the decision to stop publishing new versions of prebuilt [Terraform ${providerName} provider](${registryUrl}) bindings for [CDK for Terraform](https://cdk.tf) on ${date}. As such, this repository has been archived and is no longer supported in any way by HashiCorp. Previously-published versions of this prebuilt provider will still continue to be available on their respective package managers (e.g. npm, PyPi, Maven, NuGet), but these will not be compatible with new releases of \`cdktf\` past \`${cdktfVersion}\` and are no longer eligible for commercial support.

As a reminder, you can continue to use the \`${fqpnURL}\` provider in your CDK for Terraform (CDKTF) projects, even with newer versions of CDKTF, but you will need to generate the bindings locally. The easiest way to do so is to use the [\`provider add\` command](https://developer.hashicorp.com/terraform/cdktf/cli-reference/commands#provider-add), optionally with the \`--force-local\` flag enabled:

\`cdktf provider add ${fqpnURL} --force-local\`

For more information and additional examples, check out our documentation on [generating provider bindings manually](https://cdk.tf/imports).
    `.trim();

    const readme = `
# CDKTF prebuilt bindings for ${fqpnURL} provider version ${
      underlyingTerraformVersion !== "<unknown>"
        ? `${underlyingTerraformVersion}`
        : `${providerVersion}`
    }

${
  isDeprecated
    ? deprecationMessage
    : `This repo builds and publishes the [Terraform ${providerName} provider](${registryUrl}/docs) bindings for [CDK for Terraform](https://cdk.tf).`
}

## ${isDeprecated ? "Deprecated" : "Available"} Packages

### NPM

The npm package is available at [https://www.npmjs.com/package/${
      packageInfo.npm.name
    }](https://www.npmjs.com/package/${packageInfo.npm.name}).

\`npm install ${packageInfo.npm.name}\`

### PyPI

The PyPI package is available at [https://pypi.org/project/${
      packageInfo.python.distName
    }](https://pypi.org/project/${packageInfo.python.distName}).

\`pipenv install ${packageInfo.python.distName}\`

### Nuget

The Nuget package is available at [https://www.nuget.org/packages/${
      packageInfo.publishToNuget.packageId
    }](https://www.nuget.org/packages/${packageInfo.publishToNuget.packageId}).

\`dotnet add package ${packageInfo.publishToNuget.packageId}\`

### Maven

The Maven package is available at [https://mvnrepository.com/artifact/${
      packageInfo.publishToMaven.mavenGroupId
    }/${
      packageInfo.publishToMaven.mavenArtifactId
    }](https://mvnrepository.com/artifact/${
      packageInfo.publishToMaven.mavenGroupId
    }/${packageInfo.publishToMaven.mavenArtifactId}).

\`\`\`
<dependency>
    <groupId>${packageInfo.publishToMaven.mavenGroupId}</groupId>
    <artifactId>${packageInfo.publishToMaven.mavenArtifactId}</artifactId>
    <version>[REPLACE WITH DESIRED VERSION]</version>
</dependency>
\`\`\`

### Go

The go package is generated into the [\`${
      packageInfo.publishToGo?.moduleName
    }\`](https://${packageInfo.publishToGo?.moduleName}) package.

\`go get ${packageInfo.publishToGo?.moduleName}/${
      packageInfo.publishToGo?.packageName
    }/<version>\`

Where \`<version>\` is the version of the prebuilt provider you would like to use e.g. \`v11\`. The full module name can be found
within the [go.mod](https://${packageInfo.publishToGo?.moduleName}/blob/main/${
      packageInfo.publishToGo?.packageName
    }/go.mod#L1) file.

## Docs

Find auto-generated docs for this provider here: 

- [Typescript](./docs/API.typescript.md)
- [Python](./docs/API.python.md)
- [Java](./docs/API.java.md)
- [C#](./docs/API.csharp.md)
- [Go](./docs/API.go.md)

You can also visit a hosted version of the documentation on [constructs.dev](https://constructs.dev/packages/@cdktf/provider-${providerName}).
`;

    return isDeprecated
      ? readme
      : readme +
          `
## Versioning

This project is explicitly not tracking the Terraform ${providerName} provider version 1:1. In fact, it always tracks \`latest\` of \`${providerVersion}\` with every release. If there are scenarios where you explicitly have to pin your provider version, you can do so by [generating the provider constructs manually](https://cdk.tf/imports).

These are the upstream dependencies:

- [CDK for Terraform](https://cdk.tf)
- [Terraform ${providerName} provider](${registryUrl})
- [Terraform Engine](https://terraform.io)

If there are breaking changes (backward incompatible) in any of the above, the major version of this project will be bumped.

## Features / Issues / Bugs

Please report bugs and issues to the [CDK for Terraform](https://cdk.tf) project:

- [Create bug report](https://cdk.tf/bug)
- [Create feature request](https://cdk.tf/feature)

## Contributing

### Projen

This is mostly based on [Projen](https://github.com/projen/projen), which takes care of generating the entire repository.

### cdktf-provider-project based on Projen

There's a custom [project builder](https://github.com/cdktf/cdktf-provider-project) which encapsulate the common settings for all \`cdktf\` prebuilt providers.

### Provider Version

The provider version can be adjusted in [./.projenrc.js](./.projenrc.js).

### Repository Management

The repository is managed by [CDKTF Repository Manager](https://github.com/cdktf/cdktf-repository-manager/).
`;
  }
}
