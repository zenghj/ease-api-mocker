const express = require('express');
const router = express.Router();
const Api = require('../../db/api');
const handleError = require('../../middlewares/handleError');
function toJsonStr(str) {
  return str.replace(/\n/g, '');
}

router.all('/mock/*', (req, res, next) => {
  let reqUrl = req.path.replace('/mock', '');
  let method = req.method;
  Api.findOne({
    reqUrl,
    method
  }).exec((err, doc) => {
    if(err) {
      return next(err);
    }
    if(doc) {
      try {
        let successMock = doc.successMock;
        res.json(JSON.parse(toJsonStr(successMock)))
      } catch (err) {
        next(err)
      }
    }
  })
});

router.use(handleError);
module.exports = router;