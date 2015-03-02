var createChroniclerServer = require('basicset-chronicler').createServer;

createChroniclerServer({
  dbLocation: 'sampledcode.db',
  port: 3999
});
