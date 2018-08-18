const express = require('express');
const router = express.Router();
const {performNmapScan} = require('../helpers/trafficGeneratorHelpers');

/* POST generateTraffic
  - Accepts targetUrl body parameter
*/
router.post('/generateTraffic', function(req, res) {
  let {targetUrl} = req.body;
  if (!targetUrl){
      res.status(422);
      return res.send('Missing targetUrl required body parameter');
  }
  performNmapScan(targetUrl, err=>{
      if (err){
          res.status(500);
          return res.send(err);
      }
      return res.send('NMap scan completed successfully');
  });
});

module.exports = router;