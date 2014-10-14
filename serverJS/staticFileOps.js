var fs = require('fs');
var authorization = require('./authorization.js')

// Initial Page Request
function indexHTML(req, res, next) {

	// If the user's _id doesn't exist, error instead of showing the messages
	var auth = authorization.authUser({ _id: req.params.userID }, 
		function(user) {
			return clientFile('./index.html', 'text/html', req, res, next);
		}, 
		function() {
			res.writeHead(302, { Location: '/' });
			res.end();
			return next(false);
		});	
}

function authHTML(req, res, next) {
	return clientFile('./auth.html', 'text/html', req, res, next);
}

function clientJSFile(req, res, next) {
	return clientFile('clientJS/' + req.params.file, "text/javascript", req, res, next);
}
function clientCSSFile(req, res, next) {
	return clientFile('clientCSS/' + req.params.file, "text/css", req, res, next);
}
function clientCSSImagesFile(req, res, next) {
	return clientFile('clientCSS/images/' + req.params.file, "image/png", req, res, next);
}

function clientFile(file, contentType, req, res, next) {
	fs.readFile(__dirname + '/../' + file, function(err, data) {
		if (err) {
			next(err);
			return;
		}
		
		res.setHeader('Content-Type', contentType);
		res.writeHead(200);
		res.end(data);
		next();
	});
}

exports.authHTML = authHTML;
exports.indexHTML = indexHTML;
exports.clientJSFile = clientJSFile;
exports.clientCSSFile = clientCSSFile;
exports.clientCSSImagesFile = clientCSSImagesFile;

