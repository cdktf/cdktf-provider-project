# API Reference <a name="API Reference"></a>


## Structs <a name="Structs"></a>

### CdktfProviderProjectOptions <a name="@cdktf/provider-project.CdktfProviderProjectOptions"></a>

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { CdktfProviderProjectOptions } from '@cdktf/provider-project'

const cdktfProviderProjectOptions: CdktfProviderProjectOptions = { ... }
```

##### `name`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* `string`
- *Default:* $BASEDIR

This is the name of your project.

---

##### `commitGenerated`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.commitGenerated"></a>

```typescript
public readonly commitGenerated: boolean;
```

- *Type:* `boolean`
- *Default:* true

Whether to commit the managed files by default.

---

##### `logging`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.logging"></a>

```typescript
public readonly logging: LoggerOptions;
```

- *Type:* [`projen.LoggerOptions`](#projen.LoggerOptions)
- *Default:* {}

Configure logging options such as verbosity.

---

##### `outdir`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.outdir"></a>

```typescript
public readonly outdir: string;
```

- *Type:* `string`
- *Default:* "."

The root directory of the project.

Relative to this directory, all files are synthesized.

If this project has a parent, this directory is relative to the parent
directory and it cannot be the same as the parent or any of it's other
sub-projects.

---

##### `parent`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.parent"></a>

```typescript
public readonly parent: Project;
```

- *Type:* [`projen.Project`](#projen.Project)

The parent project, if this project is part of a bigger project.

---

##### `projenCommand`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenCommand"></a>

```typescript
public readonly projenCommand: string;
```

- *Type:* `string`
- *Default:* "npx projen"

The shell command to use in order to run the projen CLI.

Can be used to customize in special environments.

---

##### `projenrcJson`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenrcJson"></a>

```typescript
public readonly projenrcJson: boolean;
```

- *Type:* `boolean`
- *Default:* false

Generate (once) .projenrc.json (in JSON). Set to `false` in order to disable .projenrc.json generation.

---

##### `projenrcJsonOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenrcJsonOptions"></a>

```typescript
public readonly projenrcJsonOptions: ProjenrcOptions;
```

- *Type:* [`projen.ProjenrcOptions`](#projen.ProjenrcOptions)
- *Default:* default options

Options for .projenrc.json.

---

##### `renovatebot`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.renovatebot"></a>

```typescript
public readonly renovatebot: boolean;
```

- *Type:* `boolean`
- *Default:* false

Use renovatebot to handle dependency upgrades.

---

##### `renovatebotOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.renovatebotOptions"></a>

```typescript
public readonly renovatebotOptions: RenovatebotOptions;
```

- *Type:* [`projen.RenovatebotOptions`](#projen.RenovatebotOptions)
- *Default:* default options

Options for renovatebot.

---

##### `autoApproveOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.autoApproveOptions"></a>

```typescript
public readonly autoApproveOptions: AutoApproveOptions;
```

- *Type:* [`projen.github.AutoApproveOptions`](#projen.github.AutoApproveOptions)
- *Default:* auto approve is disabled

Enable and configure the 'auto approve' workflow.

---

##### `autoMerge`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.autoMerge"></a>

```typescript
public readonly autoMerge: boolean;
```

- *Type:* `boolean`
- *Default:* true

Enable automatic merging on GitHub.

Has no effect if `github.mergify`
is set to false.

---

##### `autoMergeOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.autoMergeOptions"></a>

```typescript
public readonly autoMergeOptions: AutoMergeOptions;
```

- *Type:* [`projen.github.AutoMergeOptions`](#projen.github.AutoMergeOptions)
- *Default:* see defaults in `AutoMergeOptions`

Configure options for automatic merging on GitHub.

Has no effect if
`github.mergify` or `autoMerge` is set to false.

---

##### `clobber`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.clobber"></a>

```typescript
public readonly clobber: boolean;
```

- *Type:* `boolean`
- *Default:* true

Add a `clobber` task which resets the repo to origin.

---

##### `devContainer`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.devContainer"></a>

```typescript
public readonly devContainer: boolean;
```

- *Type:* `boolean`
- *Default:* false

Add a VSCode development environment (used for GitHub Codespaces).

---

##### `github`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.github"></a>

```typescript
public readonly github: boolean;
```

- *Type:* `boolean`
- *Default:* true

Enable GitHub integration.

Enabled by default for root projects. Disabled for non-root projects.

---

##### `githubOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.githubOptions"></a>

```typescript
public readonly githubOptions: GitHubOptions;
```

- *Type:* [`projen.github.GitHubOptions`](#projen.github.GitHubOptions)
- *Default:* see GitHubOptions

Options for GitHub integration.

---

##### `gitpod`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.gitpod"></a>

```typescript
public readonly gitpod: boolean;
```

- *Type:* `boolean`
- *Default:* false

Add a Gitpod development environment.

---

##### ~~`mergify`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.mergify"></a>

- *Deprecated:* use `githubOptions.mergify` instead

```typescript
public readonly mergify: boolean;
```

- *Type:* `boolean`
- *Default:* true

Whether mergify should be enabled on this repository or not.

---

##### ~~`mergifyOptions`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.mergifyOptions"></a>

- *Deprecated:* use `githubOptions.mergifyOptions` instead

```typescript
public readonly mergifyOptions: MergifyOptions;
```

- *Type:* [`projen.github.MergifyOptions`](#projen.github.MergifyOptions)
- *Default:* default options

Options for mergify.

---

##### ~~`projectType`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projectType"></a>

- *Deprecated:* no longer supported at the base project level

```typescript
public readonly projectType: ProjectType;
```

- *Type:* [`projen.ProjectType`](#projen.ProjectType)
- *Default:* ProjectType.UNKNOWN

Which type of project this is (library/app).

---

##### `projenCredentials`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenCredentials"></a>

```typescript
public readonly projenCredentials: GithubCredentials;
```

- *Type:* [`projen.github.GithubCredentials`](#projen.github.GithubCredentials)
- *Default:* use a personal access token named PROJEN_GITHUB_TOKEN

Choose a method of providing GitHub API access for projen workflows.

---

##### ~~`projenTokenSecret`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenTokenSecret"></a>

- *Deprecated:* use `projenCredentials`

```typescript
public readonly projenTokenSecret: string;
```

- *Type:* `string`
- *Default:* "PROJEN_GITHUB_TOKEN"

The name of a secret which includes a GitHub Personal Access Token to be used by projen workflows.

This token needs to have the `repo`, `workflows`
and `packages` scope.

---

##### `readme`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.readme"></a>

```typescript
public readonly readme: SampleReadmeProps;
```

- *Type:* [`projen.SampleReadmeProps`](#projen.SampleReadmeProps)
- *Default:* { filename: 'README.md', contents: '# replace this' }

The README setup.

---

##### `stale`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.stale"></a>

```typescript
public readonly stale: boolean;
```

- *Type:* `boolean`
- *Default:* false

Auto-close of stale issues and pull request.

See `staleOptions` for options.

---

##### `staleOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.staleOptions"></a>

```typescript
public readonly staleOptions: StaleOptions;
```

- *Type:* [`projen.github.StaleOptions`](#projen.github.StaleOptions)
- *Default:* see defaults in `StaleOptions`

Auto-close stale issues and pull requests.

To disable set `stale` to `false`.

---

##### `vscode`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.vscode"></a>

```typescript
public readonly vscode: boolean;
```

- *Type:* `boolean`
- *Default:* true

Enable VSCode integration.

Enabled by default for root projects. Disabled for non-root projects.

---

##### `allowLibraryDependencies`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.allowLibraryDependencies"></a>

```typescript
public readonly allowLibraryDependencies: boolean;
```

- *Type:* `boolean`
- *Default:* true

Allow the project to include `peerDependencies` and `bundledDependencies`.

This is normally only allowed for libraries. For apps, there's no meaning
for specifying these.

---

##### `authorEmail`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.authorEmail"></a>

```typescript
public readonly authorEmail: string;
```

- *Type:* `string`

Author's e-mail.

---

##### `authorName`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.authorName"></a>

```typescript
public readonly authorName: string;
```

- *Type:* `string`

Author's name.

---

##### `authorOrganization`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.authorOrganization"></a>

```typescript
public readonly authorOrganization: boolean;
```

- *Type:* `boolean`

Author's Organization.

---

##### `authorUrl`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.authorUrl"></a>

```typescript
public readonly authorUrl: string;
```

- *Type:* `string`

Author's URL / Website.

---

##### `autoDetectBin`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.autoDetectBin"></a>

```typescript
public readonly autoDetectBin: boolean;
```

- *Type:* `boolean`
- *Default:* true

Automatically add all executables under the `bin` directory to your `package.json` file under the `bin` section.

---

##### `bin`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.bin"></a>

```typescript
public readonly bin: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}

Binary programs vended with your module.

You can use this option to add/customize how binaries are represented in
your `package.json`, but unless `autoDetectBin` is `false`, every
executable file under `bin` will automatically be added to this section.

---

##### `bugsEmail`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.bugsEmail"></a>

```typescript
public readonly bugsEmail: string;
```

- *Type:* `string`

The email address to which issues should be reported.

---

##### `bugsUrl`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.bugsUrl"></a>

```typescript
public readonly bugsUrl: string;
```

- *Type:* `string`

The url to your project's issue tracker.

---

##### `bundledDeps`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.bundledDeps"></a>

```typescript
public readonly bundledDeps: string[];
```

- *Type:* `string`[]

List of dependencies to bundle into this module.

These modules will be
added both to the `dependencies` section and `bundledDependencies` section of
your `package.json`.

The recommendation is to only specify the module name here (e.g.
`express`). This will behave similar to `yarn add` or `npm install` in the
sense that it will add the module as a dependency to your `package.json`
file with the latest version (`^`). You can specify semver requirements in
the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
this will be what you `package.json` will eventually include.

---

##### `codeArtifactOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.codeArtifactOptions"></a>

```typescript
public readonly codeArtifactOptions: CodeArtifactOptions;
```

- *Type:* [`projen.javascript.CodeArtifactOptions`](#projen.javascript.CodeArtifactOptions)
- *Default:* undefined

Options for npm packages using AWS CodeArtifact.

This is required if publishing packages to, or installing scoped packages from AWS CodeArtifact

---

##### `deps`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.deps"></a>

```typescript
public readonly deps: string[];
```

- *Type:* `string`[]
- *Default:* []

Runtime dependencies of this module.

The recommendation is to only specify the module name here (e.g.
`express`). This will behave similar to `yarn add` or `npm install` in the
sense that it will add the module as a dependency to your `package.json`
file with the latest version (`^`). You can specify semver requirements in
the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
this will be what you `package.json` will eventually include.

---

##### `description`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* `string`

The description is just a string that helps people understand the purpose of the package.

It can be used when searching for packages in a package manager as well.
See https://classic.yarnpkg.com/en/docs/package-json/#toc-description

---

##### `devDeps`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.devDeps"></a>

```typescript
public readonly devDeps: string[];
```

- *Type:* `string`[]
- *Default:* []

Build dependencies for this module.

These dependencies will only be
available in your build environment but will not be fetched when this
module is consumed.

The recommendation is to only specify the module name here (e.g.
`express`). This will behave similar to `yarn add` or `npm install` in the
sense that it will add the module as a dependency to your `package.json`
file with the latest version (`^`). You can specify semver requirements in
the same syntax passed to `npm i` or `yarn add` (e.g. `express@^2`) and
this will be what you `package.json` will eventually include.

---

##### `entrypoint`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.entrypoint"></a>

```typescript
public readonly entrypoint: string;
```

- *Type:* `string`
- *Default:* "lib/index.js"

Module entrypoint (`main` in `package.json`).

Set to an empty string to not include `main` in your package.json

---

##### `homepage`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.homepage"></a>

```typescript
public readonly homepage: string;
```

- *Type:* `string`

Package's Homepage / Website.

---

##### `keywords`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.keywords"></a>

```typescript
public readonly keywords: string[];
```

- *Type:* `string`[]

Keywords to include in `package.json`.

---

##### `license`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.license"></a>

```typescript
public readonly license: string;
```

- *Type:* `string`
- *Default:* "Apache-2.0"

License's SPDX identifier.

See https://github.com/projen/projen/tree/main/license-text for a list of supported licenses.
Use the `licensed` option if you want to no license to be specified.

---

##### `licensed`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.licensed"></a>

```typescript
public readonly licensed: boolean;
```

- *Type:* `boolean`
- *Default:* true

Indicates if a license should be added.

---

##### `maxNodeVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.maxNodeVersion"></a>

```typescript
public readonly maxNodeVersion: string;
```

- *Type:* `string`
- *Default:* no max

Minimum node.js version to require via `engines` (inclusive).

---

##### `minNodeVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.minNodeVersion"></a>

```typescript
public readonly minNodeVersion: string;
```

- *Type:* `string`
- *Default:* no "engines" specified

Minimum Node.js version to require via package.json `engines` (inclusive).

---

##### `npmAccess`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.npmAccess"></a>

```typescript
public readonly npmAccess: NpmAccess;
```

- *Type:* [`projen.javascript.NpmAccess`](#projen.javascript.NpmAccess)
- *Default:* for scoped packages (e.g. `foo@bar`), the default is
`NpmAccess.RESTRICTED`, for non-scoped packages, the default is
`NpmAccess.PUBLIC`.

Access level of the npm package.

---

##### ~~`npmRegistry`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.npmRegistry"></a>

- *Deprecated:* use `npmRegistryUrl` instead

```typescript
public readonly npmRegistry: string;
```

- *Type:* `string`

The host name of the npm registry to publish to.

Cannot be set together with `npmRegistryUrl`.

---

##### `npmRegistryUrl`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.npmRegistryUrl"></a>

```typescript
public readonly npmRegistryUrl: string;
```

- *Type:* `string`
- *Default:* "https://registry.npmjs.org"

The base URL of the npm package registry.

Must be a URL (e.g. start with "https://" or "http://")

---

##### `npmTokenSecret`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.npmTokenSecret"></a>

```typescript
public readonly npmTokenSecret: string;
```

- *Type:* `string`
- *Default:* "NPM_TOKEN"

GitHub secret which contains the NPM token to use when publishing packages.

---

##### `packageManager`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.packageManager"></a>

```typescript
public readonly packageManager: NodePackageManager;
```

- *Type:* [`projen.javascript.NodePackageManager`](#projen.javascript.NodePackageManager)
- *Default:* NodePackageManager.YARN

The Node Package Manager used to execute scripts.

---

##### `packageName`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.packageName"></a>

```typescript
public readonly packageName: string;
```

- *Type:* `string`
- *Default:* defaults to project name

The "name" in package.json.

---

##### `peerDependencyOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.peerDependencyOptions"></a>

```typescript
public readonly peerDependencyOptions: PeerDependencyOptions;
```

- *Type:* [`projen.javascript.PeerDependencyOptions`](#projen.javascript.PeerDependencyOptions)

Options for `peerDeps`.

---

##### `peerDeps`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.peerDeps"></a>

```typescript
public readonly peerDeps: string[];
```

- *Type:* `string`[]
- *Default:* []

Peer dependencies for this module.

Dependencies listed here are required to
be installed (and satisfied) by the _consumer_ of this library. Using peer
dependencies allows you to ensure that only a single module of a certain
library exists in the `node_modules` tree of your consumers.

Note that prior to npm@7, peer dependencies are _not_ automatically
installed, which means that adding peer dependencies to a library will be a
breaking change for your customers.

Unless `peerDependencyOptions.pinnedDevDependency` is disabled (it is
enabled by default), projen will automatically add a dev dependency with a
pinned version for each peer dependency. This will ensure that you build &
test your module against the lowest peer version required.

---

##### `repository`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.repository"></a>

```typescript
public readonly repository: string;
```

- *Type:* `string`

The repository is the location where the actual code for your package lives.

See https://classic.yarnpkg.com/en/docs/package-json/#toc-repository

---

##### `repositoryDirectory`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.repositoryDirectory"></a>

```typescript
public readonly repositoryDirectory: string;
```

- *Type:* `string`

If the package.json for your package is not in the root directory (for example if it is part of a monorepo), you can specify the directory in which it lives.

---

##### `scopedPackagesOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.scopedPackagesOptions"></a>

```typescript
public readonly scopedPackagesOptions: ScopedPackagesOptions[];
```

- *Type:* [`projen.javascript.ScopedPackagesOptions`](#projen.javascript.ScopedPackagesOptions)[]
- *Default:* fetch all scoped packages from the public npm registry

Options for privately hosted scoped packages.

---

##### `scripts`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.scripts"></a>

```typescript
public readonly scripts: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}
- *Default:* {}

npm scripts to include.

If a script has the same name as a standard script,
the standard script will be overwritten.

---

##### `stability`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.stability"></a>

```typescript
public readonly stability: string;
```

- *Type:* `string`

Package's Stability.

---

##### `jsiiReleaseVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.jsiiReleaseVersion"></a>

```typescript
public readonly jsiiReleaseVersion: string;
```

- *Type:* `string`
- *Default:* "latest"

Version requirement of `publib` which is used to publish modules to npm.

---

##### `majorVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.majorVersion"></a>

```typescript
public readonly majorVersion: number;
```

- *Type:* `number`
- *Default:* Major version is not enforced.

Major version to release from the default branch.

If this is specified, we bump the latest version of this major version line.
If not specified, we bump the global latest version.

---

##### `minMajorVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.minMajorVersion"></a>

```typescript
public readonly minMajorVersion: number;
```

- *Type:* `number`
- *Default:* No minimum version is being enforced

Minimal Major version to release.

This can be useful to set to 1, as breaking changes before the 1.x major
release are not incrementing the major version number.

Can not be set together with `majorVersion`.

---

##### `npmDistTag`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.npmDistTag"></a>

```typescript
public readonly npmDistTag: string;
```

- *Type:* `string`
- *Default:* "latest"

The npmDistTag to use when publishing from the default branch.

To set the npm dist-tag for release branches, set the `npmDistTag` property
for each branch.

---

##### `postBuildSteps`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.postBuildSteps"></a>

```typescript
public readonly postBuildSteps: JobStep[];
```

- *Type:* [`projen.github.workflows.JobStep`](#projen.github.workflows.JobStep)[]
- *Default:* []

Steps to execute after build as part of the release workflow.

---

##### `prerelease`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.prerelease"></a>

```typescript
public readonly prerelease: string;
```

- *Type:* `string`
- *Default:* normal semantic versions

Bump versions from the default branch as pre-releases (e.g. "beta", "alpha", "pre").

---

##### `publishDryRun`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.publishDryRun"></a>

```typescript
public readonly publishDryRun: boolean;
```

- *Type:* `boolean`
- *Default:* false

Instead of actually publishing to package managers, just print the publishing command.

---

##### `publishTasks`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.publishTasks"></a>

```typescript
public readonly publishTasks: boolean;
```

- *Type:* `boolean`
- *Default:* false

Define publishing tasks that can be executed manually as well as workflows.

Normally, publishing only happens within automated workflows. Enable this
in order to create a publishing task for each publishing activity.

---

##### `releaseBranches`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseBranches"></a>

```typescript
public readonly releaseBranches: {[ key: string ]: BranchOptions};
```

- *Type:* {[ key: string ]: [`projen.release.BranchOptions`](#projen.release.BranchOptions)}
- *Default:* no additional branches are used for release. you can use
`addBranch()` to add additional branches.

Defines additional release branches.

A workflow will be created for each
release branch which will publish releases from commits in this branch.
Each release branch _must_ be assigned a major version number which is used
to enforce that versions published from that branch always use that major
version. If multiple branches are used, the `majorVersion` field must also
be provided for the default branch.

---

##### ~~`releaseEveryCommit`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseEveryCommit"></a>

- *Deprecated:* Use `releaseTrigger: ReleaseTrigger.continuous()` instead

```typescript
public readonly releaseEveryCommit: boolean;
```

- *Type:* `boolean`
- *Default:* true

Automatically release new versions every commit to one of branches in `releaseBranches`.

---

##### `releaseFailureIssue`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseFailureIssue"></a>

```typescript
public readonly releaseFailureIssue: boolean;
```

- *Type:* `boolean`
- *Default:* false

Create a github issue on every failed publishing task.

---

##### `releaseFailureIssueLabel`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseFailureIssueLabel"></a>

```typescript
public readonly releaseFailureIssueLabel: string;
```

- *Type:* `string`
- *Default:* "failed-release"

The label to apply to issues indicating publish failures.

Only applies if `releaseFailureIssue` is true.

---

##### ~~`releaseSchedule`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseSchedule"></a>

- *Deprecated:* Use `releaseTrigger: ReleaseTrigger.scheduled()` instead

```typescript
public readonly releaseSchedule: string;
```

- *Type:* `string`
- *Default:* no scheduled releases

CRON schedule to trigger new releases.

---

##### `releaseTagPrefix`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseTagPrefix"></a>

```typescript
public readonly releaseTagPrefix: string;
```

- *Type:* `string`
- *Default:* no prefix

Automatically add the given prefix to release tags. Useful if you are releasing on multiple branches with overlapping version numbers.

Note: this prefix is used to detect the latest tagged version
when bumping, so if you change this on a project with an existing version
history, you may need to manually tag your latest release
with the new prefix.

---

##### `releaseTrigger`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseTrigger"></a>

```typescript
public readonly releaseTrigger: ReleaseTrigger;
```

- *Type:* [`projen.release.ReleaseTrigger`](#projen.release.ReleaseTrigger)
- *Default:* Continuous releases (`ReleaseTrigger.continuous()`)

The release trigger to use.

---

##### `releaseWorkflowName`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseWorkflowName"></a>

```typescript
public readonly releaseWorkflowName: string;
```

- *Type:* `string`
- *Default:* "Release"

The name of the default release workflow.

---

##### `releaseWorkflowSetupSteps`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseWorkflowSetupSteps"></a>

```typescript
public readonly releaseWorkflowSetupSteps: JobStep[];
```

- *Type:* [`projen.github.workflows.JobStep`](#projen.github.workflows.JobStep)[]

A set of workflow steps to execute in order to setup the workflow container.

---

##### `versionrcOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.versionrcOptions"></a>

```typescript
public readonly versionrcOptions: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: `any`}
- *Default:* standard configuration applicable for GitHub repositories

Custom configuration used when creating changelog with standard-version package.

Given values either append to default configuration or overwrite values in it.

---

##### `workflowContainerImage`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.workflowContainerImage"></a>

```typescript
public readonly workflowContainerImage: string;
```

- *Type:* `string`
- *Default:* default image

Container image to use for GitHub workflows.

---

##### `workflowRunsOn`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.workflowRunsOn"></a>

```typescript
public readonly workflowRunsOn: string[];
```

- *Type:* `string`[]
- *Default:* ["ubuntu-latest"]

Github Runner selection labels.

---

##### `defaultReleaseBranch`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.defaultReleaseBranch"></a>

```typescript
public readonly defaultReleaseBranch: string;
```

- *Type:* `string`
- *Default:* "main"

The name of the main release branch.

---

##### `artifactsDirectory`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.artifactsDirectory"></a>

```typescript
public readonly artifactsDirectory: string;
```

- *Type:* `string`
- *Default:* "dist"

A directory which will contain build artifacts.

---

##### `autoApproveUpgrades`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.autoApproveUpgrades"></a>

```typescript
public readonly autoApproveUpgrades: boolean;
```

- *Type:* `boolean`
- *Default:* true

Automatically approve deps upgrade PRs, allowing them to be merged by mergify (if configued).

Throw if set to true but `autoApproveOptions` are not defined.

---

##### `buildWorkflow`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.buildWorkflow"></a>

```typescript
public readonly buildWorkflow: boolean;
```

- *Type:* `boolean`
- *Default:* true if not a subproject

Define a GitHub workflow for building PRs.

---

##### `buildWorkflowTriggers`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.buildWorkflowTriggers"></a>

```typescript
public readonly buildWorkflowTriggers: Triggers;
```

- *Type:* [`projen.github.workflows.Triggers`](#projen.github.workflows.Triggers)
- *Default:* "{ pullRequest: {}, workflowDispatch: {} }"

Build workflow triggers.

---

##### `bundlerOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.bundlerOptions"></a>

```typescript
public readonly bundlerOptions: BundlerOptions;
```

- *Type:* [`projen.javascript.BundlerOptions`](#projen.javascript.BundlerOptions)

Options for `Bundler`.

---

##### `codeCov`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.codeCov"></a>

```typescript
public readonly codeCov: boolean;
```

- *Type:* `boolean`
- *Default:* false

Define a GitHub workflow step for sending code coverage metrics to https://codecov.io/ Uses codecov/codecov-action@v1 A secret is required for private repos. Configured with @codeCovTokenSecret.

---

##### `codeCovTokenSecret`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.codeCovTokenSecret"></a>

```typescript
public readonly codeCovTokenSecret: string;
```

- *Type:* `string`
- *Default:* if this option is not specified, only public repositories are supported

Define the secret name for a specified https://codecov.io/ token A secret is required to send coverage for private repositories.

---

##### `copyrightOwner`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.copyrightOwner"></a>

```typescript
public readonly copyrightOwner: string;
```

- *Type:* `string`
- *Default:* defaults to the value of authorName or "" if `authorName` is undefined.

License copyright owner.

---

##### `copyrightPeriod`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.copyrightPeriod"></a>

```typescript
public readonly copyrightPeriod: string;
```

- *Type:* `string`
- *Default:* current year

The copyright years to put in the LICENSE file.

---

##### `dependabot`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.dependabot"></a>

```typescript
public readonly dependabot: boolean;
```

- *Type:* `boolean`
- *Default:* false

Use dependabot to handle dependency upgrades.

Cannot be used in conjunction with `depsUpgrade`.

---

##### `dependabotOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.dependabotOptions"></a>

```typescript
public readonly dependabotOptions: DependabotOptions;
```

- *Type:* [`projen.github.DependabotOptions`](#projen.github.DependabotOptions)
- *Default:* default options

Options for dependabot.

---

##### `depsUpgrade`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.depsUpgrade"></a>

```typescript
public readonly depsUpgrade: boolean;
```

- *Type:* `boolean`
- *Default:* true

Use github workflows to handle dependency upgrades.

Cannot be used in conjunction with `dependabot`.

---

##### `depsUpgradeOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.depsUpgradeOptions"></a>

```typescript
public readonly depsUpgradeOptions: UpgradeDependenciesOptions;
```

- *Type:* [`projen.javascript.UpgradeDependenciesOptions`](#projen.javascript.UpgradeDependenciesOptions)
- *Default:* default options

Options for `UpgradeDependencies`.

---

##### `gitignore`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.gitignore"></a>

```typescript
public readonly gitignore: string[];
```

- *Type:* `string`[]

Additional entries to .gitignore.

---

##### `jest`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.jest"></a>

```typescript
public readonly jest: boolean;
```

- *Type:* `boolean`
- *Default:* true

Setup jest unit tests.

---

##### `jestOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.jestOptions"></a>

```typescript
public readonly jestOptions: JestOptions;
```

- *Type:* [`projen.javascript.JestOptions`](#projen.javascript.JestOptions)
- *Default:* default options

Jest options.

---

##### `mutableBuild`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.mutableBuild"></a>

```typescript
public readonly mutableBuild: boolean;
```

- *Type:* `boolean`
- *Default:* true

Automatically update files modified during builds to pull-request branches.

This means
that any files synthesized by projen or e.g. test snapshots will always be up-to-date
before a PR is merged.

Implies that PR builds do not have anti-tamper checks.

---

##### ~~`npmignore`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.npmignore"></a>

- *Deprecated:* - use `project.addPackageIgnore`

```typescript
public readonly npmignore: string[];
```

- *Type:* `string`[]

Additional entries to .npmignore.

---

##### `npmignoreEnabled`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.npmignoreEnabled"></a>

```typescript
public readonly npmignoreEnabled: boolean;
```

- *Type:* `boolean`
- *Default:* true

Defines an .npmignore file. Normally this is only needed for libraries that are packaged as tarballs.

---

##### `package`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.package"></a>

```typescript
public readonly package: boolean;
```

- *Type:* `boolean`
- *Default:* true

Defines a `package` task that will produce an npm tarball under the artifacts directory (e.g. `dist`).

---

##### `prettier`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.prettier"></a>

```typescript
public readonly prettier: boolean;
```

- *Type:* `boolean`
- *Default:* false

Setup prettier.

---

##### `prettierOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.prettierOptions"></a>

```typescript
public readonly prettierOptions: PrettierOptions;
```

- *Type:* [`projen.javascript.PrettierOptions`](#projen.javascript.PrettierOptions)
- *Default:* default options

Prettier options.

---

##### `projenDevDependency`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenDevDependency"></a>

```typescript
public readonly projenDevDependency: boolean;
```

- *Type:* `boolean`
- *Default:* true

Indicates of "projen" should be installed as a devDependency.

---

##### `projenrcJs`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenrcJs"></a>

```typescript
public readonly projenrcJs: boolean;
```

- *Type:* `boolean`
- *Default:* true if projenrcJson is false

Generate (once) .projenrc.js (in JavaScript). Set to `false` in order to disable .projenrc.js generation.

---

##### `projenrcJsOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenrcJsOptions"></a>

```typescript
public readonly projenrcJsOptions: ProjenrcOptions;
```

- *Type:* [`projen.javascript.ProjenrcOptions`](#projen.javascript.ProjenrcOptions)
- *Default:* default options

Options for .projenrc.js.

---

##### `projenVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenVersion"></a>

```typescript
public readonly projenVersion: string;
```

- *Type:* `string`
- *Default:* Defaults to the latest version.

Version of projen to install.

---

##### `pullRequestTemplate`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.pullRequestTemplate"></a>

```typescript
public readonly pullRequestTemplate: boolean;
```

- *Type:* `boolean`
- *Default:* true

Include a GitHub pull request template.

---

##### `pullRequestTemplateContents`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.pullRequestTemplateContents"></a>

```typescript
public readonly pullRequestTemplateContents: string[];
```

- *Type:* `string`[]
- *Default:* default content

The contents of the pull request template.

---

##### `release`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.release"></a>

```typescript
public readonly release: boolean;
```

- *Type:* `boolean`
- *Default:* true (false for subprojects)

Add release management to this project.

---

##### `releaseToNpm`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseToNpm"></a>

```typescript
public readonly releaseToNpm: boolean;
```

- *Type:* `boolean`
- *Default:* false

Automatically release to npm when new versions are introduced.

---

##### ~~`releaseWorkflow`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.releaseWorkflow"></a>

- *Deprecated:* see `release`.

```typescript
public readonly releaseWorkflow: boolean;
```

- *Type:* `boolean`
- *Default:* true if not a subproject

DEPRECATED: renamed to `release`.

---

##### `workflowBootstrapSteps`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.workflowBootstrapSteps"></a>

```typescript
public readonly workflowBootstrapSteps: JobStep[];
```

- *Type:* [`projen.github.workflows.JobStep`](#projen.github.workflows.JobStep)[]
- *Default:* "yarn install --frozen-lockfile && yarn projen"

Workflow steps to use in order to bootstrap this repo.

---

##### `workflowGitIdentity`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.workflowGitIdentity"></a>

```typescript
public readonly workflowGitIdentity: GitIdentity;
```

- *Type:* [`projen.github.GitIdentity`](#projen.github.GitIdentity)
- *Default:* GitHub Actions

The git identity to use in workflows.

---

##### `workflowNodeVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.workflowNodeVersion"></a>

```typescript
public readonly workflowNodeVersion: string;
```

- *Type:* `string`
- *Default:* same as `minNodeVersion`

The node version to use in GitHub workflows.

---

##### `disableTsconfig`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.disableTsconfig"></a>

```typescript
public readonly disableTsconfig: boolean;
```

- *Type:* `boolean`
- *Default:* false

Do not generate a `tsconfig.json` file (used by jsii projects since tsconfig.json is generated by the jsii compiler).

---

##### `docgen`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.docgen"></a>

```typescript
public readonly docgen: boolean;
```

- *Type:* `boolean`
- *Default:* false

Docgen by Typedoc.

---

##### `docsDirectory`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.docsDirectory"></a>

```typescript
public readonly docsDirectory: string;
```

- *Type:* `string`
- *Default:* "docs"

Docs directory.

---

##### `entrypointTypes`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.entrypointTypes"></a>

```typescript
public readonly entrypointTypes: string;
```

- *Type:* `string`
- *Default:* .d.ts file derived from the project's entrypoint (usually lib/index.d.ts)

The .d.ts file that includes the type declarations for this module.

---

##### `eslint`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.eslint"></a>

```typescript
public readonly eslint: boolean;
```

- *Type:* `boolean`
- *Default:* true

Setup eslint.

---

##### `eslintOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.eslintOptions"></a>

```typescript
public readonly eslintOptions: EslintOptions;
```

- *Type:* [`projen.javascript.EslintOptions`](#projen.javascript.EslintOptions)
- *Default:* opinionated default options

Eslint options.

---

##### `libdir`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.libdir"></a>

```typescript
public readonly libdir: string;
```

- *Type:* `string`
- *Default:* "lib"

Typescript  artifacts output directory.

---

##### `projenrcTs`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenrcTs"></a>

```typescript
public readonly projenrcTs: boolean;
```

- *Type:* `boolean`
- *Default:* false

Use TypeScript for your projenrc file (`.projenrc.ts`).

---

##### `projenrcTsOptions`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.projenrcTsOptions"></a>

```typescript
public readonly projenrcTsOptions: ProjenrcOptions;
```

- *Type:* [`projen.typescript.ProjenrcOptions`](#projen.typescript.ProjenrcOptions)

Options for .projenrc.ts.

---

##### `sampleCode`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.sampleCode"></a>

```typescript
public readonly sampleCode: boolean;
```

- *Type:* `boolean`
- *Default:* true

Generate one-time sample in `src/` and `test/` if there are no files there.

---

##### `srcdir`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.srcdir"></a>

```typescript
public readonly srcdir: string;
```

- *Type:* `string`
- *Default:* "src"

Typescript sources directory.

---

##### `testdir`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.testdir"></a>

```typescript
public readonly testdir: string;
```

- *Type:* `string`
- *Default:* "test"

Jest tests directory. Tests files should be named `xxx.test.ts`.

If this directory is under `srcdir` (e.g. `src/test`, `src/__tests__`),
then tests are going to be compiled into `lib/` and executed as javascript.
If the test directory is outside of `src`, then we configure jest to
compile the code in-memory.

---

##### `tsconfig`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.tsconfig"></a>

```typescript
public readonly tsconfig: TypescriptConfigOptions;
```

- *Type:* [`projen.javascript.TypescriptConfigOptions`](#projen.javascript.TypescriptConfigOptions)
- *Default:* default options

Custom TSConfig.

---

##### `tsconfigDev`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.tsconfigDev"></a>

```typescript
public readonly tsconfigDev: TypescriptConfigOptions;
```

- *Type:* [`projen.javascript.TypescriptConfigOptions`](#projen.javascript.TypescriptConfigOptions)
- *Default:* use the production tsconfig options

Custom tsconfig options for the development tsconfig.json file (used for testing).

---

##### `tsconfigDevFile`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.tsconfigDevFile"></a>

```typescript
public readonly tsconfigDevFile: string;
```

- *Type:* `string`
- *Default:* "tsconfig.dev.json"

The name of the development tsconfig.json file.

---

##### `typescriptVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.typescriptVersion"></a>

```typescript
public readonly typescriptVersion: string;
```

- *Type:* `string`
- *Default:* "latest"

TypeScript version to use.

NOTE: Typescript is not semantically versioned and should remain on the
same minor, so we recommend using a `~` dependency (e.g. `~1.2.3`).

---

##### `author`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.author"></a>

```typescript
public readonly author: string;
```

- *Type:* `string`
- *Default:* $GIT_USER_NAME

The name of the library author.

---

##### `authorAddress`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.authorAddress"></a>

```typescript
public readonly authorAddress: string;
```

- *Type:* `string`
- *Default:* $GIT_USER_EMAIL

Email or URL of the library author.

---

##### `repositoryUrl`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.repositoryUrl"></a>

```typescript
public readonly repositoryUrl: string;
```

- *Type:* `string`
- *Default:* $GIT_REMOTE

Git repository URL.

---

##### `compat`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.compat"></a>

```typescript
public readonly compat: boolean;
```

- *Type:* `boolean`
- *Default:* false

Automatically run API compatibility test against the latest version published to npm after compilation.

You can manually run compatibility tests using `yarn compat` if this feature is disabled.
- You can ignore compatibility failures by adding lines to a ".compatignore" file.

---

##### `compatIgnore`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.compatIgnore"></a>

```typescript
public readonly compatIgnore: string;
```

- *Type:* `string`
- *Default:* ".compatignore"

Name of the ignore file for API compatibility tests.

---

##### `docgenFilePath`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.docgenFilePath"></a>

```typescript
public readonly docgenFilePath: string;
```

- *Type:* `string`
- *Default:* "API.md"

File path for generated docs.

---

##### ~~`dotnet`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.dotnet"></a>

- *Deprecated:* use `publishToNuget`

```typescript
public readonly dotnet: JsiiDotNetTarget;
```

- *Type:* [`projen.cdk.JsiiDotNetTarget`](#projen.cdk.JsiiDotNetTarget)

---

##### `excludeTypescript`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.excludeTypescript"></a>

```typescript
public readonly excludeTypescript: string[];
```

- *Type:* `string`[]

Accepts a list of glob patterns.

Files matching any of those patterns will be excluded from the TypeScript compiler input.

By default, jsii will include all *.ts files (except .d.ts files) in the TypeScript compiler input.
This can be problematic for example when the package's build or test procedure generates .ts files
that cannot be compiled with jsii's compiler settings.

---

##### `publishToGo`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.publishToGo"></a>

```typescript
public readonly publishToGo: JsiiGoTarget;
```

- *Type:* [`projen.cdk.JsiiGoTarget`](#projen.cdk.JsiiGoTarget)
- *Default:* no publishing

Publish Go bindings to a git repository.

---

##### `publishToMaven`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.publishToMaven"></a>

```typescript
public readonly publishToMaven: JsiiJavaTarget;
```

- *Type:* [`projen.cdk.JsiiJavaTarget`](#projen.cdk.JsiiJavaTarget)
- *Default:* no publishing

Publish to maven.

---

##### `publishToNuget`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.publishToNuget"></a>

```typescript
public readonly publishToNuget: JsiiDotNetTarget;
```

- *Type:* [`projen.cdk.JsiiDotNetTarget`](#projen.cdk.JsiiDotNetTarget)
- *Default:* no publishing

Publish to NuGet.

---

##### `publishToPypi`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.publishToPypi"></a>

```typescript
public readonly publishToPypi: JsiiPythonTarget;
```

- *Type:* [`projen.cdk.JsiiPythonTarget`](#projen.cdk.JsiiPythonTarget)
- *Default:* no publishing

Publish to pypi.

---

##### ~~`python`~~<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.python"></a>

- *Deprecated:* use `publishToPyPi`

```typescript
public readonly python: JsiiPythonTarget;
```

- *Type:* [`projen.cdk.JsiiPythonTarget`](#projen.cdk.JsiiPythonTarget)

---

##### `rootdir`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.rootdir"></a>

```typescript
public readonly rootdir: string;
```

- *Type:* `string`
- *Default:* "."

---

##### `cdktfVersion`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.cdktfVersion"></a>

```typescript
public readonly cdktfVersion: string;
```

- *Type:* `string`

---

##### `constructsVersion`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.constructsVersion"></a>

```typescript
public readonly constructsVersion: string;
```

- *Type:* `string`

---

##### `terraformProvider`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.terraformProvider"></a>

```typescript
public readonly terraformProvider: string;
```

- *Type:* `string`

---

##### `forceMajorVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.forceMajorVersion"></a>

```typescript
public readonly forceMajorVersion: number;
```

- *Type:* `number`

---

##### `githubNamespace`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.githubNamespace"></a>

```typescript
public readonly githubNamespace: string;
```

- *Type:* `string`

defaults to "hashicorp".

---

##### `jsiiVersion`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.jsiiVersion"></a>

```typescript
public readonly jsiiVersion: string;
```

- *Type:* `string`

---

##### `mavenEndpoint`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.mavenEndpoint"></a>

```typescript
public readonly mavenEndpoint: string;
```

- *Type:* `string`

---

##### `namespace`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.namespace"></a>

```typescript
public readonly namespace: string;
```

- *Type:* `string`

defaults to "cdktf".

---

##### `nugetOrg`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.nugetOrg"></a>

```typescript
public readonly nugetOrg: string;
```

- *Type:* `string`

defaults to "HashiCorp".

---

##### `useCustomGithubRunner`<sup>Optional</sup> <a name="@cdktf/provider-project.CdktfProviderProjectOptions.property.useCustomGithubRunner"></a>

```typescript
public readonly useCustomGithubRunner: boolean;
```

- *Type:* `boolean`

---

## Classes <a name="Classes"></a>

### CdktfProviderProject <a name="@cdktf/provider-project.CdktfProviderProject"></a>

#### Initializers <a name="@cdktf/provider-project.CdktfProviderProject.Initializer"></a>

```typescript
import { CdktfProviderProject } from '@cdktf/provider-project'

new CdktfProviderProject(options: CdktfProviderProjectOptions)
```

##### `options`<sup>Required</sup> <a name="@cdktf/provider-project.CdktfProviderProject.parameter.options"></a>

- *Type:* [`@cdktf/provider-project.CdktfProviderProjectOptions`](#@cdktf/provider-project.CdktfProviderProjectOptions)

---






