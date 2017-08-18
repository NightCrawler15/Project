var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8082;
var firebase = require('firebase');
var validator = require('validator');
var sendgrid = require('sendgrid')(process.env.Send_Grid_API);
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

var config = {
    apiKey: "AIzaSyDMgttzSHl4MNGfsS8cGuxNS8O8sSGkaYw",
    authDomain: "myatm-a26a7.firebaseapp.com",
    databaseURL: "https://myatm-a26a7.firebaseio.com",
    projectId: "myatm-a26a7",
    storageBucket: "myatm-a26a7.appspot.com",
    messagingSenderId: "969451023357"
};
firebase.initializeApp(config);


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
//app.set('trust proxy', 1);
app.use(express.static(__dirname + '/MyATM1.0'));
app.set('view engine', 'jade');


app.post('/register', function(req, res) {
	//res.sendfile('MyATM/maps.html', {root: __dirname});
	res.send("hello");
});

var entryType;
var currentUser;
var securitynum;
var onlineUser;

io.on('connection', function(socket) {
	app.get('/loginpage', function(req,res) {

		res.redirect('/'); 
		//coord();
		
	});
	app.get('/mappage', function(req,res) {

		res.sendFile('MyATM1.0/map.html', {root: __dirname});
		//coord();
		
	});

	app.get('/validatepage', function(req,res) {
		res.sendFile('MyATM1.0/validate.html', {root: __dirname});
	});

	function encrypt(text){
	  var cipher = crypto.createCipher(algorithm,password)
	  var crypted = cipher.update(text,'utf8','hex')
	  crypted += cipher.final('hex');
	  return crypted;
	}
 
	function decrypt(text){
	  var decipher = crypto.createDecipher(algorithm,password)
	  var dec = decipher.update(text,'hex','utf8')
	  dec += decipher.final('utf8');
	  return dec;
	}

	//Map Page
	socket.on("Get Status", function(data) {
		var currStat, queStat;
		var totalStat = 0;
		var workStat = 0;
		var CurH = 0;
		var CurF = 0;
		var CurT = 0;
		var qS = 0;
		var qM = 0;
		var qL = 0;
		var queue;
		var currStat;
		var statusRef = firebase.database().ref().child("ATM Status");
		var bname = data.BankName;
		bname = bname.replace(/\s/g, '');
		bname = bname.replace(/\./g, '');
		var idis = data.PosId + "-" + bname;
		//console.log("Getting status");


		statusRef.once("value").then(function (snap) {
			//console.log(snap.val());
			if (snap.exists()) {
				snap.forEach(function(childSnap) {
					if (childSnap.val().ATMId == idis) {
						totalStat = totalStat + 1;
					}
					if (childSnap.val().ATMId == idis) {
						if (childSnap.val().WorkStatus == "Working") {			
							workStat = workStat + 1;
						}
					}

					if (childSnap.val().Queue == "Short") qS = qS + 1;
					else if (childSnap.val().Queue == "Medium") qM = qM +1;
					else qL = qL + 1;

					if (childSnap.val().Currency == "Rs 100") CurH = CurH + 1;
					else if (childSnap.val().Currency == "Rs 500") CurF = CurF + 1;
					else if (childSnap.val().Currency == "Rs 2000") CurT = CurT + 1;
				});

				if (qS > qM && qS > qL) queue = "short";
				else if (qM > qS && qM > qL) queue = "medium";
				else queue = "long";

				if (CurT > CurF && CurT > CurH) currStat = "Rs 100, Rs 500 & Rs 2000";
				else if (CurF > CurT && CurF > CurH) currStat = "Rs 100 & Rs 500";
				else currStat = "only Rs 100"
				var possibility = workStat/totalStat * 100;
				if (possibility < 40 && possibility >= 0) {
					possibility = 100 - possibility;
					socket.emit("Status Found", "ATM not working with " + possibility+"% chance");
				} else if (possibility > 40 && possibility < 60) {
					socket.emit("Status Found", "May be working, only " + possibility+"% chance.");
				} else if (possibility > 60 && possibility <= 100) {
					socket.emit("Status Found", "ATM is working with " + possibility+"% of chance. Queue may be " + queue + " and has " + currStat + " notes.") ;
				} else {
					socket.emit("Status Found", "No data available");
				}					
			} else {
				socket.emit("Status Found", "No data available");
			}
			

		});

		//console.log(totalStat);
		//console.log(workStat);

		/*if (qS > qM && qS > qL) queue = "short";
		else if (qM > qS && qM > qL) queue = "medium";
		else queue = "long";

		if (CurT > CurF && CurT > CurH) currStat = "Rs 100, Rs 500 & Rs 2000";
		else if (CurF > CurT && CurF > CurH) currStat = "Rs 100 & Rs 500";
		else currStat = "only Rs 100";*/
	});

	socket.on("Status Update", function(data) {
		//making firebase database ref
		var oneDay = 24*60*60*1000 //ms
		var statusRef = firebase.database().ref().child("ATM Status");
		var userUpdated = firebase.database().ref().child("User Last Updated");

		var bname = data.BankName;
		bname = bname.replace(/\s/g, '');
		bname = bname.replace(/\./g, '');
		var idis = data.PosId + "-" + bname;

		//making an object reference, to check if user have already updated or not
		var userExistRef = firebase.database().ref('/User Last Updated/'+ idis + '-' + onlineUser);
		userExistRef.once('value').then(function(snap){
			//console.log(snap.val().TimeOfUpdate);
			if(snap.exists()) {

				//check if the user for this bank has already uupdate
				if((Date.now() - snap.val().TimeOfUpdate) < oneDay) {
					var period = (Date.now() - snap.val().TimeOfUpdate) /3600000;
					period = Math.round((24-period) * 100) / 100;
					socket.emit("Update Error", "You cannot update till " + period + " hrs. for this atm! Thank You!");
				} else {
					//console.log("ihave already updated");
					//updating user update timestamp
					var updates = {};
					updates['/User Last Updated/'+idis + '-' + onlineUser+'/TimeOfUpdate'] = Date.now();
					updates['/ATM Status/'+idis + '-' + onlineUser+'/WorkStatus'] = data.AStat;
					updates['/ATM Status/'+idis + '-' + onlineUser+'/Queue'] = data.Queue;
					updates['/ATM Status/'+idis + '-' + onlineUser+'/Currency'] = data.Curr;
					firebase.database().ref().update(updates);
					//inserting data in ATM Status
					socket.emit("Update Done"); 
				}
			} else {
				console.log("my first update");
				userUpdated.child(idis + "-" + onlineUser).set({
					TimeOfUpdate: Date.now(),
				});

				statusRef.child(idis + "-" + onlineUser).set({
					ATMId: idis,
					Stat: idis + "_" + data.AStat,
				    BankName: data.BankName,
					PositionId: data.PosId,
					User: onlineUser,
					WorkStatus: data.AStat,
					Queue: data.Queue,
					Currency: data.Curr,
				});

				socket.emit("Update Done"); 
			}
		});

		

		

	});

	socket.on('log out', function() {
		//console.log("logout");
		var promise = firebase.auth().signOut();
		promise.catch(e => {
			console.log("logged out");
		})
	});

	//login sign up page
	socket.on('login user', function (data) {
		entryType = 'login';
		currentUser = data;
		//console.log(data);
    	var auth = firebase.auth();
		var promise = auth.signInWithEmailAndPassword(data.EMail,data.Password);
		promise.catch(e => {
			var err = {type: "email", message: e.message}
			socket.emit('login alert', err);
		});
  	});

	socket.on('signup user', function (data) {
		//console.log(data);
		entryType = 'signup';
		currentUser = data;
		if(validator.isEmail(data.EMail)) {
			securitynum = Math.floor(Math.random() * 90000) + 10000;
			var request = sendgrid.emptyRequest({
				method: 'POST',
				path: '/v3/mail/send',
				body: {
				   personalizations: [
				   {
				    to: [
				        {
				          email: currentUser.EMail
				        }
				     ],
				       subject: 'Email Verification for MyATM account'
				     }
				   ],
				   from: {
				    email: 'signup@myatm.contact'
				   },
				   content: [
				    {
				      type: 'text/plain',
				      value: 'Thank you, for being part of MyATM. Before, continuing please validate the given security code: ' + securitynum,
				      html: '<b>' + securitynum + '</b>',
				    }
				   ]
				  }
				});
				
			sendgrid.API(request)
			  .then(function (response) {
			    socket.emit('signup done');
			  })
			  .catch(function (error) {
			  	var err = {type: "email", message: "Currently cannot send validation code in your mail!"}
				socket.emit('signup alert', err);
			  });
		} else {
			var err = {type: "email", message: "Not a validate email address"}
			socket.emit('signup alert', err);
		}
	});

	//validate page
	socket.on('Signup Valid', function(data) {
		//console.log("i am here");
		if(securitynum == data) {
			var auth = firebase.auth();
			var promise = auth.createUserWithEmailAndPassword(currentUser.EMail,currentUser.Password);
			promise.catch(e => {
				var err = {type: "email", message: e.message}
				socket.emit('signup alert', err);
			});
		} else {
			var err = {type: "email", message: "Not the valid security number!"};
			socket.emit('signup alert', err);
		}
	});

	firebase.auth().onAuthStateChanged(firebaseUser => {
		if (firebaseUser) {
			onlineUser = firebaseUser.uid;
			//console.log(entryType);
			if(entryType == "signup") {
				//making firebase database reference
				var signUPRef = firebase.database().ref().child("User Detail");
				//inserting in User Details
				signUPRef.child(firebaseUser.uid).set({
					Name: currentUser.Name,
					LastName: currentUser.Last_name,
					Email: currentUser.EMail,
					Password: encrypt(currentUser.Password),
					Mobile: currentUser.Mobile_Num,
					NoReport: currentUser.Num_reports,
				});
				socket.emit('after signup', "Moving to maps page");
			} else if (entryType == "login") {
				socket.emit('after login', "Moving to maps page");
			} 
			
		} else {
			socket.emit('user logout');
		}
	});

});