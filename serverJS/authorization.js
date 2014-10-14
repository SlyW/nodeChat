var Datastore = require('nedb')
  , usersDB = new Datastore();
  
// Users
function authUser(filter, cbSuccess, cbFail) {
	usersDB.find( filter, function (err, users) {
		if (users.length === 0) {
			cbFail();
		} 
		else {
			cbSuccess(users[0]);
		}
		return;
	});
}

function registerUser(req, res, next) {
	// In this case, we "reverse" the success/failure for authorization
	// since we want a NEW username. So, if we successfully find the user, 
	// then we return failure, otherwise we create a new user
	var auth = authUser({ username: req.params.user }, 
		function(user) {
			res.send(500, "Username '" + user.username + "' already in use. Please try again.");
			return next();
		}, 
		function() {
			var user = { username: req.params.user,
						 loggedon: new Date()
					   };
			usersDB.insert(user, function(err, newUser) {
				res.send( newUser );
			});
		});
	
	return next();	
}

function getUsers(req, res, next) {
	var auth = authUser({ _id: req.params.userID }, 
		function(user) {
			usersDB.find({}, function(err, users) {
				var respUsers = { count: 0, users: [] };
				users.forEach(function(u) { 
					respUsers.count++; 
					respUsers.users.push( { username: u.username, loggedon: u.loggedon } ); 
				});
				res.send(respUsers);
				return next();
			});
		},
		function() {
			res.send(500, "User record not found - please reauthenticate <a href='/'>here</a>");
			return next();
		});
}

function getUserInfo(req, res, next) {
	var auth = authUser({ _id: req.params.userID }, 
		function(user) {
			res.send(user);
			return next();
		},
		function() {
			res.send(500, "User record not found - please reauthenticate <a href='/'>here</a>");
			return next();
		});
	
}

exports.authUser = authUser;
exports.registerUser = registerUser;
exports.getUsers = getUsers;
exports.getUserInfo = getUserInfo;
