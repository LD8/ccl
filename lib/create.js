/**
 * 命令行交互，使用什么模板创建，将远端模板下载到本地
 */

const axios = require('axios')
const inquirer = require('inquirer')
const ora = require('ora')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const downloadGitRepo = promisify(require('download-git-repo')) // 接收参数(gitUserName/repoName#versionTag)

const download = async (repoName, tagName) => {
  const cacheDir = `${process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']}/.tmp`
  const apiAddress = `zcegg/${repoName}${tagName ? '#' + tagName : ''}`

  const dest = tagName ? path.resolve(cacheDir, repoName, tagName) : path.resolve(cacheDir, repoName)
  const destExists = fs.existsSync(dest)
  const spinner = ora('Downloading... ').start()
  if (!destExists) {
    await downloadGitRepo(apiAddress, dest)
    spinner.succeed('Download complete!')
  }
  return dest
}

// 工具方法：loading
const spinn = (fetchFunc) => async (...args) => {
  const spinner = ora('Start fetching data...').start()
  try {
    const result = await fetchFunc(...args)
    // spinner.succeed('Fetch done!')
    return result
  } catch (err) {
    // console.log(err)
    spinner.fail('Fetch failed...')
  }
}

const fetchRepos = async () => {
  const { data } = await axios.get('https://api.github.com/users/zcegg/repos')
  return data.map(d => d.name)
}

const fetchRepoTags = async (repoName) => {
  const { data } = await axios.get(`https://api.github.com/repos/zcegg/${repoName}/tags`)
  return data.map(d => d.name)
}

module.exports = async (args) => {
  const repoNames = await spinn(fetchRepos)()
  console.log(repoNames)

  const { selectedRepoName } = await inquirer.prompt({
    type: 'list',
    name: 'selectedRepoName',
    message: 'Please select repository to download',
    choices: repoNames
  })
  console.log(selectedRepoName)

  const tags = await spinn(fetchRepoTags)(selectedRepoName)
  console.log(tags)

  if (tags.length) {
    const { selectedTag } = await inquirer.prompt({
      type: 'list',
      name: 'selectedTag',
      message: 'Please select a tag/version',
      choices: tags
    })
    // console.log(inquireResult) // { selectedTag: 'v0.1.1' }
    console.log(selectedTag)

    const dest = await download(selectedRepoName, selectedTag)
    console.log(dest)
  } else {
    const { confirmation } = await inquirer.prompt({
      type: 'confirm',
      name: 'confirmation',
      message: 'Confirm to download?'
    })
    console.log(confirmation)

    if (confirmation) {
      const dest = await download(selectedRepoName)
      console.log(dest)
    } else {

    }
  }
}
