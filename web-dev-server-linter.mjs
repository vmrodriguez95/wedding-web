/* eslint-disable no-console */
import { createFilter } from '@rollup/pluginutils'
import { ESLint } from 'eslint'
import stylelint from 'stylelint'

let allFilesProcessed = false
let fileProcessedInterval = undefined

const eslint = new ESLint()
const jsProcessedFiles = []
const styleProcessedFiles = []
const lintScripts = () => {
  if(jsProcessedFiles.length === 0) return

  eslint.lintFiles(jsProcessedFiles).then(results => {
    eslint.loadFormatter('stylish').then(formatter => {
      const resultText = formatter.format(results)
      const errors = results.filter(result => result.errorCount > 0 || result.warningCount > 0)

      if(errors.length === 0) return

      console.log('\x1b[36m[JS] Errors found:\x1b[0m')
      console.log(resultText)
    })
  })
}
const lintStyles = () => {
  if(styleProcessedFiles.length === 0) return

  stylelint.lint({
    customSyntax: 'postcss-scss',
    files: styleProcessedFiles
  }).then(resultObject => {
    const output = JSON.parse(resultObject.output)
    let errors = 0

    output.forEach(file => {
      if(file.errored) {
        console.log('\x1b[35m[Style] Errors found:\x1b[0m\n')
        console.log(file.source)
        file.warnings.forEach(warning =>
          console.log(`  ${ warning.line }:${ warning.column }`,`\x1b[31m ${ warning.severity }`, `\x1b[0m ${ warning.text }`)
        )
        errors++
      }
    })
    if(errors) console.log(`\x1b[91m\n✖ ${ errors } problems (${ errors } errors, 0 warnings)\x1b[0m`)
  })
}

export const lintPlugin = () => {
  return {
    name: 'lint',
    transform(context) {
      const filter = createFilter(['src/**/*.scss', 'src/**/*.js'], /node_modules/)
      const __dirname = import.meta.url.substring(7, import.meta.url.lastIndexOf('/'))
      const __filename = __dirname + context.originalUrl
      const __ext = context.originalUrl.substring(context.originalUrl.lastIndexOf('.'), context.originalUrl.length)

      if(!filter(__filename)) return

      if(jsProcessedFiles.includes(__filename) || styleProcessedFiles.includes(__filename)) {
        lintStyles()
        lintScripts()
      } else {
        if(__ext === '.js') jsProcessedFiles.push(__filename)
        if(__ext === '.scss') styleProcessedFiles.push(__filename)
      }

      if(!allFilesProcessed) {
        clearTimeout(fileProcessedInterval)
        fileProcessedInterval = setTimeout(() => {
          allFilesProcessed = true
          lintStyles()
          lintScripts()
        }, 350)
      }
    }
  }
}
