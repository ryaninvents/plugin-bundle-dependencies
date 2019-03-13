import hasYarn from 'has-yarn';
import execa from 'execa';
import { resolve } from 'path';
import fs from 'fs-extra';

const LOCAL_PACKAGE_PREFIX = 'file:';

export async function npmPack (pkgPath, workingDir) {
  const { stdout } = await execa('npm', ['pack', '--json', pkgPath], {
    cwd: workingDir
  });
  const [output] = JSON.parse(stdout);
  return resolve(workingDir, output.filename);
}

export function getPackageManagerCommand ({ cwd, options }) {
  if (options.packageManager) {
    const { packageManager } = options;
    if (packageManager === 'npm') {
      return { bin: 'npm', args: ['install'] };
    } else if (packageManager === 'yarn') {
      return { bin: 'yarn', args: [] };
    }
    const errors = [];
    const { bin } = packageManager;
    if (typeof bin !== 'string') {
      errors.push(`Expected \`packageManager.bin\` to be a string (got ${typeof bin})`);
    }
    const { args = [] } = packageManager;
    if (args) {
      if (!Array.isArray(args) || args.some((arg) => typeof arg !== 'string')) {
        errors.push(`Expected \`packageManager.args\` to be an array of arguments`);
      }
    }
    return { bin, args };
  }
  if (hasYarn(cwd)) {
    return { bin: 'yarn', args: [] };
  }
  return { bin: 'npm', args: ['install'] };
}

export async function createManifest (tempdir, { cwd, manifest }) {
  const updatedManifest = { ...manifest };
  const originalDeps = manifest.dependencies || {};
  updatedManifest.dependencies = { ...originalDeps };

  await Promise.all(Object.keys(originalDeps).map(async (pkgName) => {
    const pkgVersion = originalDeps[pkgName];
    if (!pkgVersion.startsWith(LOCAL_PACKAGE_PREFIX)) return;
    const absolutePath = resolve(cwd, pkgVersion.slice(LOCAL_PACKAGE_PREFIX.length));
    const bundledAbsolutePath = await npmPack(absolutePath, cwd);
    updatedManifest.dependencies[pkgName] = `${LOCAL_PACKAGE_PREFIX}${bundledAbsolutePath}`;
  }));

  await fs.writeFile(resolve(tempdir, 'package.json'), JSON.stringify(updatedManifest, null, 2));
}

export async function installDependencies (tempdir, { cwd, options = {} }) {
  const { bin, args } = getPackageManagerCommand({ cwd, options });
  const env = {
    NODE_ENV: 'production',
    ...(options.env || {})
  };
  try {
    await execa(bin, args, {
      cwd: tempdir,
      env,
      stdio: options.stdio || 'ignore'
    });
  } catch (err) {
    err.message += `\n${err.stdout}`;
    throw err;
  }
}
