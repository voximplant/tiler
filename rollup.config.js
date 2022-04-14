import commonJs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import visualizer from 'rollup-plugin-visualizer';
import { sizeSnapshot } from 'rollup-plugin-size-snapshot';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const production = process.env.NODE_ENV === 'production';
const entries = [];

const getPlugins = () => {
  const dev = [
    nodeResolve(),
    commonJs(),
    typescript({
      tsconfig: 'tsconfig.json',
    }),
    terser(),
  ];
  return production
    ? dev.concat([
        sizeSnapshot({ snapshotPath: 'coverage/.size-snapshot.json' }),
        visualizer({ filename: 'coverage/stats.json' }),
      ])
    : dev;
};

const globalDependencies = {};

function addModule(folder, inFile, outFile, browserPath) {
  entries.push(
    {
      input: 'src/modules/' + folder + '/' + inFile + '.ts',
      output: [
        {
          format: 'cjs',
          sourcemap: !production,
          file: 'dist/modules/' + folder + '/' + outFile + '.cjs.min.js',
        },
        {
          format: 'esm',
          sourcemap: !production,
          file: 'dist/modules/' + folder + '/' + outFile + '.esm.min.js',
        },
        {
          format: 'iife',
          name: 'VoxTiler.' + browserPath,
          file: 'dist/modules/' + folder + '/' + outFile + '.min.js',
          sourcemap: !production,
          globals: globalDependencies,
        },
      ],
      plugins: getPlugins(),
      external: ['@voximplant/websdk'],
    },
    {
      input: 'types/modules/' + folder + '/' + inFile + '.d.ts',
      output: [{ file: 'dist/modules/' + folder + '/' + outFile + '.d.ts', format: 'es' }],
      plugins: [dts()],
    }
  );
}

function addModules() {
  // addModule('dumb', 'index', 'dumb', 'dumb');
}

function addCore() {
  entries.push(
    {
      input: 'src/index.ts',
      output: [
        {
          format: 'cjs',
          sourcemap: !production,
          file: 'dist/index.cjs.min.js',
        },
        {
          format: 'esm',
          sourcemap: !production,
          file: 'dist/index.esm.min.js',
        },
        {
          format: 'iife',
          name: 'VoxTiler',
          file: 'dist/index.min.js',
          sourcemap: !production,
          globals: globalDependencies,
        },
      ],
      plugins: getPlugins(),
    },
    {
      input: 'types/index.d.ts',
      output: [{ file: 'dist/index.d.ts', format: 'es' }],
      plugins: [dts()],
    }
  );
}

addCore();
addModules();

export default entries;
