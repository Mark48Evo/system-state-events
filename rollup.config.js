import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default [
  {
    input: pkg.module,
    output: [
      {
        file: 'bin/system-state-events.js',
        format: 'cjs',
        sourcemap: true,
        banner: '#!/usr/bin/env node',
      },
    ],
    external: [
      'debug',
      'redis',
      'amqplib',
      '@mark48evo/system-events',
      '@mark48evo/system-state',
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        envName: 'rollup',
      }),
    ],
  },
];
