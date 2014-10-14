var restify = require('restify');
var msgs = require('./serverJS/messages.js');
var authorization = require('./serverJS/authorization.js');
var staticFile = require('./serverJS/staticFileOps.js');


var server = restify.createServer();

///////////////////////////
// Routing               //
///////////////////////////

// Static Files
server.get('/', staticFile.authHTML);
server.get({ name: 'index', path: '/msgs/:userID' }, staticFile.indexHTML);
server.get('/clientJS/:file', staticFile.clientJSFile);
server.get('/clientCSS/:file', staticFile.clientCSSFile);
server.get('/clientCSS/images/:file', staticFile.clientCSSImagesFile);

// Users
server.post('/auth/:user', authorization.registerUser);
server.get('/users/:userID', authorization.getUsers);
server.get('/getUserInfo/:userID', authorization.getUserInfo);

// Messages
server.post('/postmsg/:userID/:msg', msgs.postMessage);
server.get('/getmsgs/:userID', msgs.getMessages);
server.get('/usermsgs/:userID/:user', msgs.getMessagesByUser);

server.listen(43434, function() {
	console.log('%s listening at %s', server.name, server.url);
});

