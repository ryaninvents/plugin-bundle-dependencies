import gulp from 'gulp';
import gulpZip from 'gulp-zip';
import del from 'del';
import { join } from 'path';
import { promiseFromObjectStream } from './p-stream.js';
import fs from 'fs-extra';
import { dir as createTempDir } from 'temporarily';
import { MessageError } from '@pika/types';
import rename from 'gulp-rename';

import { createManifest, installDependencies } from './util';

const ZIP_FILENAME = 'dist-dependencies.zip';

export async function beforeJob ({ out }) {
  const srcDirectory = join(out, 'dist-node/');
  if (!fs.existsSync(srcDirectory)) {
    throw new MessageError('"dist-node/" does not exist, or was not yet created in the pipeline.');
  }
}

export async function build ({ cwd, out, manifest, reporter, options }) {
  const { filepath: tempWorkingDir } = createTempDir({ name: 'plugin-bundle-dependencies-{wwwwdddd}' });
  let { prefix = '/' } = options;
  if (!prefix.endsWith('/')) prefix = `${prefix}/`;

  await createManifest(tempWorkingDir, { cwd, manifest });
  await installDependencies(tempWorkingDir, { cwd, options });

  await promiseFromObjectStream(
    gulp.src(join(tempWorkingDir, 'node_modules', '**'), { dot: true, buffer: true })
      .pipe(rename((path) => {
        Object.assign(path, {
          dirname: join(prefix, path.dirname)
        });
      }))
      .pipe(gulpZip(ZIP_FILENAME))
      .pipe(gulp.dest(out))
  );

  reporter.created(join(out, ZIP_FILENAME), `zip:dependencies`);

  await del([tempWorkingDir], { force: true });
}
