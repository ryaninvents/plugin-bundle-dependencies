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

For more details on setting up Pack, refer to the [@pika/pack repository](https://github.com/pikapkg/pack).

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)