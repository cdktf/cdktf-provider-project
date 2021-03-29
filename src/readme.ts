import { FileBase, FileBaseOptions, IResolver, Project } from 'projen';

export interface ReadmeFileOptions extends FileBaseOptions {
  terraformProvider: string;
  providerName: string;
  providerVersion: string;
}

export class ReadmeFile extends FileBase {
  protected readonly options: ReadmeFileOptions;

  constructor(project: Project, filePath: string, options: ReadmeFileOptions) {
    super(project, filePath, options);
    this.options = options;
  }

  protected synthesizeContent(resolver: IResolver) {
    const { providerName, providerVersion } = resolver.resolve(this.options);

    return `
# Terraform CDK ${providerName} Provider ${providerVersion}

This repo builds and publishes the Terraform ${providerName} Provider bindings for [cdktf](https://cdk.tf).

Current build targets are:

- npm
- Pypi
- Nuget
- Maven

## Docs

Find auto-generated docs for this provider here: [./API.md](./API.md)

## Versioning

This project is explicitly not tracking the Terraform ${providerName} Provider version 1:1. In fact, it always tracks \`latest\` of \`${providerVersion}\` with every release. If there scenarios where you explicitly have to pin your provider version, you can do so by generating the [provider constructs manually](https://cdk.tf/imports).

These are the upstream dependencies:

- [Terraform CDK](https://cdk.tf)
- [Terraform ${providerName} Provider](https://github.com/terraform-providers/terraform-provider-${providerName})
- [Terraform Engine](https://terraform.io)

If there are breaking changes (backward incompatible) in any of the above, the major version of this project will be bumped. While the Terraform Engine and the Terraform ${providerName} Provider are relatively stable, the Terraform CDK is in an early stage. Therefore, it's likely that there will be breaking changes.

## Features / Issues / Bugs

Please report bugs and issues to the [terraform cdk](https://cdk.tf) project:

- [Create bug report](https://cdk.tf/bug)
- [Create feature request](https://cdk.tf/feature)

## Contributing

## projen

This is mostly based on [projen](https://github.com/eladb/projen), which takes care of generating the entire repository.

## cdktf-provider-project based on projen

There's a custom [project builder](https://github.com/terraform-cdk-providers/cdktf-provider-project) which encapsulate the common settings for all \`cdktf\` providers.

## provider version

The provider version can be adjusted in [./.projenrc.js](./.projenrc.js).

`;
  }
}
