import { esbuildPlugin } from '@web/dev-server-esbuild'
import { fromRollup } from '@web/dev-server-rollup'
import { esBuild, bundles, styleBundles } from './esbuild.config.mjs'
import { lintPlugin } from './web-dev-server-linter.mjs'
import postcss from 'rollup-plugin-postcss'
import svg from 'rollup-plugin-svg-import'

const postcssRollup = fromRollup(postcss)
const svgRollup = fromRollup(svg)

export default {
  nodeResolve: true,
  plugins: [
    lintPlugin(),
    esbuildPlugin({
      loaders: { '.js': 'ts' },
      target: 'es2020'
    }),
    postcssRollup(),
    svgRollup(),
    esBuild('style', 'dev', styleBundles),
    esBuild('bundle', 'dev', bundles)
  ],
  mimeTypes: {
    '**/*.scss': 'js',
    '**/*.svg': 'js'
  },
  open: '/',
  watch: true,
  port: 6006,
  logStartMessage: false,
  appIndex: 'dist/index.html',
  rootDir: 'dist'
}
