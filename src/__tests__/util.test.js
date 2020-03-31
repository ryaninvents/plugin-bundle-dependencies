import fs from 'fs-extra';
import { join, relative } from 'path';
import { dir as createTempDir, file as createTempFile } from 'temporarily';
import del from 'del';

import { createManifest, installDependencies } from '../util';

const DEFAULT_PKG_JSON = {
  name: 'test-pkg',
  private: true,
  version: '0.0.0-develop',
  scripts: {
    build: 'pack build'
  },
  '@pika/pack': {
    pipeline: [
      ['@pika/plugin-standard-pkg'],
      [
        '@pika/plugin-build-node',
        {
          minNodeVersion: '8'
        }
      ]
    ]
  },
  devDependencies: {
    '@pika/pack': '^0.3.1',
    '@pika/plugin-build-node': '^0.3.10',
    '@pika/plugin-standard-pkg': '^0.3.10'
  }
};

describe('util', () => {
  let createdDirs = [];

  async function initRepo({
    packageJson: pkg = DEFAULT_PKG_JSON,
    packageManager = 'npm',
    stdio,
    skipInstall = false
  } = {}) {
    const { filepath: workingDir } = createTempDir({ name: 'test-repo-{wwwwdddd}' }, [
      createTempDir({ name: 'src' }, [createTempFile({ name: 'index.js', data: '// Hello world' })])
    ]);
    let packageJson = pkg;
    if (typeof packageJson === 'function') {
      packageJson = packageJson(workingDir);
    }
    await fs.writeFile(join(workingDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    if (!skipInstall) {
      await installDependencies(workingDir, {
        cwd: workingDir,
        options: { env: { NODE_ENV: 'development' } },
        packageManager
      });
    }
    createdDirs.push(workingDir);
    return { workingDir };
  }

  afterEach(async () => {
    await del(createdDirs, { force: true });
    createdDirs = [];
  });

  describe('createManifest', () => {
    it('should honor package overrides', async () => {
      const { filepath: tempPkgDir } = createTempDir({ name: 'test-tempdir-{wwwwdddd}' });
      const libProj = await initRepo({
        packageJson: {
          ...DEFAULT_PKG_JSON,
          name: 'test-library'
        }
      });
      await fs.writeFile(`${libProj.workingDir}/index.js`, '// Hello world');
      const mainProj = await initRepo({
        packageJson: mainDir => ({
          ...DEFAULT_PKG_JSON,
          dependencies: {
            'test-library': `0.0.0-semantically-released`
          }
        }),
        // Need to skip `install` step because otherwise `npm` will try to resolve our local package.
        skipInstall: true
      });
      const pkgJson = JSON.parse(String(await fs.readFile(`${mainProj.workingDir}/package.json`)));
      const resultingManifest = await createManifest(tempPkgDir, {
        cwd: mainProj.workingDir,
        manifest: pkgJson,
        packageOverrides: {
          'test-library': `file:${relative(mainProj.workingDir, libProj.workingDir)}`
        }
      });
      expect(resultingManifest.dependencies['test-library']).toMatch(/^file:/);
    }, 60e3);
  });
});
