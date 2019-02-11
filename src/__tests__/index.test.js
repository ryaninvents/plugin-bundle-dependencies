import fs from 'fs-extra';
import { join, relative } from 'path';
import { dir as createTempDir } from 'temporarily';
import del from 'del';
import { installDependencies } from '../util';

const DEFAULT_PKG_JSON = {
  name: 'test-pkg',
  private: true,
  version: '0.0.0-develop',
  'devDependencies': {
    '@pika/pack': '^0.3.1',
    '@pika/plugin-build-node': '^0.3.10',
    '@pika/plugin-standard-pkg': '^0.3.10'
  }
};

describe('@ryaninvents/plugin-bundle-dependencies', () => {
  let createdDirs = [];

  async function initRepo ({ packageJson: pkg = DEFAULT_PKG_JSON, packageManager = 'npm', stdio } = {}) {
    const { filepath: workingDir } = createTempDir({ name: 'test-repo-{wwwwdddd}' });
    let packageJson = pkg;
    if (typeof packageJson === 'function') {
      packageJson = packageJson(workingDir);
    }
    await fs.writeFile(join(workingDir, 'package.json'), JSON.stringify(packageJson, null, 2));
    await installDependencies(workingDir, {
      cwd: workingDir,
      packageManager,
      stdio
    });
    createdDirs.push(workingDir);
    return { workingDir };
  }

  afterEach(async () => {
    await del(createdDirs, { force: true });
    createdDirs = [];
  });

  it('should create a repo and install node_modules', async () => {
    const { workingDir } = await initRepo({ stdio: 'inherit' });
    expect(async () => fs.access(`${workingDir}/package.json`, fs.constants.F_OK))
      .not.toThrow();
    expect(async () => fs.access(`${workingDir}/node_modules`, fs.constants.X_OK))
      .not.toThrow();
  }, 60e3);

  it('should correctly resolve local dependencies', async () => {
    const { workingDir: libraryWorkingDir } = await initRepo({
      packageJson: {
        ...DEFAULT_PKG_JSON,
        name: 'test-library'
      },
      stdio: 'inherit'
    });
    await fs.writeFile(`${libraryWorkingDir}/index.js`, '// Hello world');
    const { workingDir: mainProjectWorkingDir } = await initRepo({
      packageJson: (mainDir) => ({
        ...DEFAULT_PKG_JSON,
        dependencies: {
          'test-library': `file:${relative(mainDir, libraryWorkingDir)}`
        }
      }),
      stdio: 'inherit'
    });
    expect(async () => fs.access(`${mainProjectWorkingDir}/node_modules/test-library`, fs.constants.X_OK))
      .not.toThrow();
    const contents = String(await fs.readFile(`${mainProjectWorkingDir}/node_modules/test-library/index.js`));
    expect(contents).toBe('// Hello world');
  }, 60e3);
}, 60e3);
