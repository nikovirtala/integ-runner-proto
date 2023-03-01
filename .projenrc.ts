import { awscdk, DependencyType, JsonFile } from "projen";

const cdkVersion = "2.66.1";

const project = new awscdk.AwsCdkTypeScriptApp({
  authorEmail: "niko.virtala@hey.com",
  authorName: "Niko Virtala",
  authorUrl: "https://nikovirtala.io",
  cdkVersion: cdkVersion,
  defaultReleaseBranch: "main",
  license: "MIT",
  minNodeVersion: "18.13.0",
  name: "integ-runner-proto",
  prettier: true,
  projenrcTs: true,
  deps: [
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb",
    "@middy/core",
    "@middy/event-normalizer",
    "@types/aws-lambda",
    "source-map-support",
  ],
});

// integration test with `integ-runner` and `integ-tests`
project.deps.addDependency(
  `@aws-cdk/integ-runner@^${cdkVersion}`,
  DependencyType.DEVENV
);
project.deps.addDependency(
  `@aws-cdk/integ-tests-alpha@^${cdkVersion}-alpha.0`,
  DependencyType.DEVENV
);

const integSnapshotTask = project.addTask("integ", {
  description: "Run integration snapshot tests",
  receiveArgs: true,
  exec: "integ-runner --language typescript",
});

project.addTask("integ:update", {
  description: "Run and update integration snapshot tests",
  exec: "integ-runner --language typescript --update-on-failed",
  receiveArgs: true,
});

new JsonFile(project, "integ.config.json", {
  obj: {
    maxWorkers: 10,
    parallelRegions: ["eu-west-1"],
  },
  marker: false,
});

project.testTask.spawn(integSnapshotTask);
project.synth();
