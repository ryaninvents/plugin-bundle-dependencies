# @ryaninvents/plugin-bundle-dependencies

> Plugin for [@pika/pack](https://github.com/pikapkg/pack) to zip your package's dependencies

[![CircleCI build status](https://img.shields.io/circleci/project/github/ryaninvents/plugin-bundle-dependencies/develop.svg?logo=circleci&style=flat)](https://circleci.com/gh/ryaninvents/plugin-bundle-dependencies)
[![View on npm](https://img.shields.io/npm/v/@ryaninvents/plugin-bundle-dependencies.svg?style=flat)](https://www.npmjs.com/package/@ryaninvents/plugin-bundle-dependencies)
[![GitHub repository](https://img.shields.io/github/stars/ryaninvents/plugin-bundle-dependencies.svg?style=social)](https://github.com/ryaninvents/plugin-bundle-dependencies)
[![License](https://img.shields.io/npm/l/@ryaninvents/plugin-bundle-dependencies.svg?style=flat)](https://www.npmjs.com/package/@ryaninvents/plugin-bundle-dependencies)

## Why would I want this?

This package creates a zip file containing your `node_modules`. After the build step runs, the zip file will be available in `./pkg/dist-dependencies.zip`.

I built this package because I wanted to build an AWS Lambda function source zip using Pika Pack.

## Installation

Use the package manager [npm](https://docs.npmjs.com/about-npm/) to install `@ryaninvents/plugin-bundle-dependencies`.

```bash
npm install --save-dev @ryaninvents/plugin-bundle-dependencies
```

Then, modify your `@pika/pack` configuration in your `package.json` to enable:

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-node"],
      ["@ryaninvents/plugin-bundle-dependencies"]
    ]
  }
}
```

For more details on setting up Pack, refer to the [@pika/pack repository](https://github.com/pikapkg/pack). For details on configuring `plugin-bundle-dependencies`, keep reading.

## Options

### `prefix`

Add a fixed prefix to every file in the ZIP archive. By default, the zip contains exactly what would be installed into the `node_modules` directory -- phrased another way, if you unzipped an archive generated with the default settings, you would create one folder in your working directory for each of your package's dependencies.

> Listing your archive would look something like this:
> ```
> $ unzip -Z1 pkg/dist-dependencies.zip
> express/package.json
> express/index.js
> express/README.md
> lodash/package.json
> lodash/index.js
> # ... etc.
> ```

Use the `prefix` option to package all dependencies into a set of nested folders. For example, when deploying to an [AWS Lambda layer](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html), dependencies should be extracted to the `nodejs/node_modules` subdirectory of the extraction location. To set it up this way, modify your pipeline:

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-node"],
      ["@ryaninvents/plugin-bundle-dependencies", {
        "prefix": "nodejs/node_modules"
      }]
    ]
  }
}
```

> Listing your archive would look something like this:
> ```
> $ unzip -Z1 pkg/dist-dependencies.zip
> nodejs/node_modules/express/package.json
> nodejs/node_modules/express/index.js
> nodejs/node_modules/express/README.md
> nodejs/node_modules/lodash/package.json
> nodejs/node_modules/lodash/index.js
> # ... etc.
> ```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)