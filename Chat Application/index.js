// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "easy_talk"
});


server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/EasyTalk'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;
var flag = 1;
var flag1 = 1;
var flag3 = 1;

io.on('connection', function (socket) {
  var addedUser = false;

  // when a client login
  socket.on('login user', function (data) {
    var x = 'SELECT * FROM user_detail';
    //console.log("inside login user");
    con.query(x, function(err, rows, fields) {
      if (err) console.log("line 41");
      //console.log("inside rows");
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].username === data.username_l && rows[i].password === data.password_l) {
          flag1 = 0;
          //console.log("wow");
          con.query('SELECT * FROM login_detail', function(err, rowss, fields) {
            if (err) console.log("line 47");

            //console.log("here");

            for (var j = 0; j < rowss.length; j++) {
              if (rowss[j].username_l === data.username_l) {
                flag3 = 0;
                socket.emit('already login');
                break;
              }
            }

            if (flag3 === 1) {
              //console.log(data.username + "signed up");
              con.query('INSERT INTO login_detail SET ?', data, function(err,res){
                if(err) console.log("");
              });        
              socket.emit('after joining', data);    
            }
          });
        }
      }

      if (flag1 === 1) {
        socket.emit('login alert');
        //console.log("invalid")
      }
    });
  });

  // when a new client sign's up
  socket.on('sign up', function (data) {
    var x = 'SELECT * FROM user_detail';
    //var count = con.query(x);
    //console.log(count); 
    //console.log(x);
    con.query(x, function(err, rows, fields) {
       if (err) throw err;

      for (var i = 0; i < rows.length; i++) {
        if (rows[i].username === data.username) {
          flag = 0;
          socket.emit('signup alert',flag);
          break;
        }
      }

      if (flag === 1) {
        //console.log(data.username + "signed up");
        con.query('INSERT INTO user_detail SET ?', data, function(err,res){
          if(err) throw err;

          console.log(data.username + ' has signed up...');
        });
      
        socket.emit('after joining', data);
      }
    });
  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });

    console.log(socket.username + " : " + data);
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });

    // server is showing the connected clients
    console.log(socket.username + " has joined chatroom...");
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
      var x = 'DELETE FROM login_detail WHERE username_l=' + '"' + socket.username + '"';
      con.query(x, function(err) {
        if (err) console.log("not deleting");
      });

      // server is showing disconnected users
      console.log(socket.username + " has left chatroom...");
    }
  });
});