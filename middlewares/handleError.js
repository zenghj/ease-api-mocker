const errorLogger = require('./logger').errorLogger;

module.exports = function handleError (err, req, res, next) {
  // 处理500未知错误
  errorLogger(err, req, res, next);
  return res.status(500).send({
      // error: err,
      status: 500,
      message: err.message || '未知服务器错误',
  })
}
