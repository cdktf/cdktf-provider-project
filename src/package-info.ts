export interface PackageInfo {
  npm: {
    name: string;
  };
  python: {
    distName: string;
    module: string;
  };
  publishToNuget: {
    dotNetNamespace: string;
    packageId: string;
  };
  publishToMaven: {
    javaPackage: string;
    mavenGroupId: string;
    mavenArtifactId: string;
  };
};