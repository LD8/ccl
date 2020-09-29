#!/usr/bin/env node

const { program } = require('commander')
const pack = require('../package.json')
const mainFn = require('..')

const actionDefinitions = {
  create: {
    alias: 'crt',
    description: 'This is a command to create something',
    examples: ['tsti create <project_name>']
  },
  config: {
    alias: 'cfg',
    description: 'configuration of something',
    examples: ['tsti config set <k> <v>', 'tsti config get <k>']
  }
}

// console.log(Object.keys(actionDefinitions))
// console.log(Reflect.ownKeys(actionDefinitions))

Object.keys(actionDefinitions).forEach((actName) => {
  const act = actionDefinitions[actName]
  program
    .command(actName)
    .alias(act.alias)
    .description(act.description)
    .action(() => {
      mainFn(actName, process.argv.slice(3))
    })
})

program.on('--help', () => {
  console.log('\nExamples:')
  Object.keys(actionDefinitions).forEach((actName) => {
    const examples = actionDefinitions[actName].examples
    if (examples) {
      examples.forEach((example) => console.log(' ', example))
    }
  })
})

program.version(pack.version).parse(process.argv)
