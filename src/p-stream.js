export function promiseFromObjectStream (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve).on('error', reject);
  });
}
