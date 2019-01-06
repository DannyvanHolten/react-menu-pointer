import babelJest from 'babel-jest';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');

export function process(src, filename) { // eslint-disable-line import/prefer-default-export
    return babelJest.process(src, filename);
}
