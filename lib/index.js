module.exports = (actName, args) => {
  // 模块分发
  require('./' + actName)(args)
}
