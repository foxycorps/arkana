import { defineConfig } from 'tsup'
import { name } from './package.json'

export default defineConfig({
    name,
    entry: ['./src/index.ts'],
    dts: true,
    skipNodeModulesBundle: true,
    bundle: true,
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
})