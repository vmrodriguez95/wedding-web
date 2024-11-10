import { esBuild, bundles, styleBundles } from './esbuild.config.mjs'
const version = new Date().getTime().toString()

esBuild('style', 'pro', styleBundles, version)
esBuild('bundle', 'pro', bundles, version)
