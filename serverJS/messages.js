var Datastore = require('nedb')
  , msgsDB = new Datastore();
var authorization = require('./authorization.js');
var sanitizeHtml = require('sanitize-html');

// Message Post Routines
function postMessage(req, res, next) {
	authorization.authUser({ _id: req.params.userID },
		function(user) {
			var msg = { user: user.username,
						message: decodeAndSanitizeMsg(req.params.msg),
						posted: new Date()
					  };
			msgsDB.insert(msg, function (err, newMsg) { 
				var respMsgs = { count: 0, msgs: [] };
				respMsgs.count++;
				respMsgs.msgs.push({user: newMsg.user, message: encodeMsg(newMsg.message), posted: newMsg.posted});
				res.send(respMsgs);
			});
		},
		function() {
			res.send(500, "User record not found - please reauthenticate <a href='/'>here</a>");
			return next();
		});
	
	
	return next();
}
  
// Message Fetch Routines
function getMessages(req, res, next, filter) {

	authorization.authUser({ _id: req.params.userID },
		function(user) {
			filter = filter || {};
			var respMsgs = { count: 0, msgs: [] };
				
			msgsDB.find(filter).sort({posted: 1}).exec(function(err, msgs) {
				if (msgs.length > 0) {
					msgs.forEach(function(d) { 
						respMsgs.count++;
						respMsgs.msgs.push({user: d.user, message: encodeMsg(d.message), posted: d.posted});
					});
					res.send(respMsgs);
				} else {
					res.send(respMsgs);
				}
			});
		},
		function () {
			res.send(500, "User record not found - please reauthenticate <a href='/'>here</a>");
			return next();
		});
	
	return next();
}

function getMessagesByUser(req, res, next) {
	authorization.authUser( { _id: req.params.userID },
		function(user) {
			return getMessages( req, res, next, {user: req.params.user} );
		},
		function() {
			res.send(500, "User record not found - please reauthenticate <a href='/'>here</a>");
			return next();
		});
}

function encodeMsg(msg) {
	return encodeURIComponent(msg).replace(/'/g,"%27").replace(/"/g,"%22");
}
function decodeAndSanitizeMsg(msg) {
	var dirtyMsg = decodeURIComponent(msg.replace(/\+/g,  " "));
	var cleanMsg = sanitizeHtml(dirtyMsg, {
		allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'img' ],
		allowedAttributes: {
			'a': [ 'href', 'target' ],
			'img': [ 'src', 'width', 'height' ]
		}
	});
	return cleanMsg;
}

msgsDB.insert({ user: 'Maxx (Admin)',
			message: 'Welcome to the machine!',
			posted: new Date()
		  }, function (err, newMsg) { });
msgsDB.insert({ user: 'Maxx (Admin)',
			message: 'Stay a while, stay FOREVER!',
			posted: new Date()
		  }, function (err, newMsg) { });
  
exports.getMessages = getMessages;
exports.postMessage = postMessage;
exports.getMessagesByUser = getMessagesByUser;
