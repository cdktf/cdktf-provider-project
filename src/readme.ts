import { FileBase, FileBaseOptions, IResolver, Project } from "projen";
import { PackageInfo } from "./package-info";

export interface ReadmeFileOptions extends FileBaseOptions {
  providerName: string;
  fqproviderName: string;
  providerVersion: string;
  packageInfo: PackageInfo;
}

export class ReadmeFile extends FileBase {
  protected readonly options: ReadmeFileOptions;

  constructor(project: Project, filePath: string, options: ReadmeFileOptions) {
    super(project, filePath, options);
    this.options = options;
  }

  protected synthesizeContent(resolver: IResolver) {
    const { providerName, fqproviderName, providerVersion, packageInfo } =
      resolver.resolve(this.options) as ReadmeFileOptions;

    const fqpnURL = fqproviderName.includes("/")
      ? fqproviderName
      : `hashicorp/${fqproviderName}`;
    const versionURL = providerVersion
      ? providerVersion.replace(/~>\s*/, "").concat(".0")
      : "";

    return `
# Terraform CDK ${providerName} Provider ${providerVersion}

This repo builds and publishes the Terraform ${providerName} Provider bindings for [CDK for Terraform](https://cdk.tf).

## Available Packages

### NPM

The npm package is available at [https://www.npmjs.com/package/${packageInfo.npm.name}](https://www.npmjs.com/package/${packageInfo.npm.name}).

\`npm install ${packageInfo.npm.name}\`

### PyPI

The PyPI package is available at [https://pypi.org/project/${packageInfo.python.distName}](https://pypi.org/project/${packageInfo.python.distName}).

\`pipenv install ${packageInfo.python.distName}\`

### Nuget

The Nuget package is available at [https://www.nuget.org/packages/${packageInfo.publishToNuget.packageId}](https://www.nuget.org/packages/${packageInfo.publishToNuget.packageId}).

\`dotnet add package ${packageInfo.publishToNuget.packageId}\`

### Maven

The Maven package is available at [https://mvnrepository.com/artifact/${packageInfo.publishToMaven.mavenGroupId}/${packageInfo.publishToMaven.mavenArtifactId}](https://mvnrepository.com/artifact/${packageInfo.publishToMaven.mavenGroupId}/${packageInfo.publishToMaven.mavenArtifactId}).

\`\`\`
<dependency>
    <groupId>${packageInfo.publishToMaven.mavenGroupId}</groupId>
    <artifactId>${packageInfo.publishToMaven.mavenArtifactId}</artifactId>
    <version>[REPLACE WITH DESIRED VERSION]</version>
</dependency>
\`\`\`


### Go

The go package is generated into the [\`${packageInfo.publishToGo?.moduleName}\`](https://${packageInfo.publishToGo?.moduleName}) package.

\`go get ${packageInfo.publishToGo?.moduleName}/${packageInfo.publishToGo?.packageName}\`

## Docs

Find auto-generated docs for this provider here: 

- [Typescript](./docs/API.typescript.md)
- [Python](./docs/API.python.md)
- [Java](./docs/API.java.md)
- [C#](./docs/API.csharp.md)
- [Go](./docs/API.go.md)

You can also visit a hosted version of the documentation on [constructs.dev](https://constructs.dev/packages/@cdktf/provider-${providerName}).

## Versioning

This project is explicitly not tracking the Terraform ${providerName} Provider version 1:1. In fact, it always tracks \`latest\` of \`${providerVersion}\` with every release. If there are scenarios where you explicitly have to pin your provider version, you can do so by generating the [provider constructs manually](https://cdk.tf/imports).

These are the upstream dependencies:

- [Terraform CDK](https://cdk.tf)
- [Terraform ${providerName} Provider](https://registry.terraform.io/providers/${fqpnURL}/${versionURL})
    - This links to the minimum version being tracked, you can find the latest released version [in our releases](https://github.com/cdktf/cdktf-provider-${providerName}/releases)
- [Terraform Engine](https://terraform.io)

If there are breaking changes (backward incompatible) in any of the above, the major version of this project will be bumped.

## Features / Issues / Bugs

Please report bugs and issues to the [terraform cdk](https://cdk.tf) project:

- [Create bug report](https://cdk.tf/bug)
- [Create feature request](https://cdk.tf/feature)

## Contributing

### projen

This is mostly based on [projen](https://github.com/eladb/projen), which takes care of generating the entire repository.

### cdktf-provider-project based on projen

There's a custom [project builder](https://github.com/hashicorp/cdktf-provider-project) which encapsulate the common settings for all \`cdktf\` providers.

### Provider Version

The provider version can be adjusted in [./.projenrc.js](./.projenrc.js).

### Repository Management

The repository is managed by [Repository Manager](https://github.com/hashicorp/cdktf-repository-manager/)
`;
  }
}
