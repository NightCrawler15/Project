$(function(){
	var $window = $(window);
	var $login_email = $('#login-email');
	var $login_password = $('#login-password');
	var $signup_username = $('#form-username');
	var $signup_password = $('#form-password');
	var $signup_email = $('#form-email');
	var $signup_mobile = $('#form-mobile');
	var $signup_lname = $('#form-lname');
	var $login = $('#loginBTN');
	var $signup = $('#signupBTN');

	//var connected = false;
	var username;
	var password;
	var email;
	var mobile
	var lname;
	var socket = io();

    function newuserjoined (data) {
    	//getlocation();
    	window.location.href = '/mappage';

    }

    
    function loginerror(data) {
    	if (data.type == "email") alert(data.message);
    }

    function signuperror (data) {
    	if (data.type == "email") alert(data.message);
    	if (data.value == "password") alert("Password length least of 8 characters...");
    	else if (data.value == "username") alert("Username already exist...");
    }

    function showvalidating () {
    	window.location.href = '/validatepage';
    }

    $("#loginBTN").click(function() {
    	email = $login_email.val().trim();
    	password = $login_password.val().trim();

    	if (!email) {
    		alert("Please Enter Email");
    	}else if (!password) {
    		alert("Please Enter Password");
    	}else{
    		socket.emit('login user', {EMail: email, Password: password});
    	}

    });

    $("#signupBTN").click(function() {
    	//console.log("yoda");
    	username = $signup_username.val().trim();
    	password = $signup_password.val().trim();
    	email = $signup_email.val().trim();
    	mobile = $signup_mobile.val().trim();
    	lname = $signup_lname.val().trim();
    	socket.emit('signup user', {Name: username, Password: password, EMail: email, Mobile_Num: mobile, Last_name: lname, Num_reports: 0});
    });

    socket.on('signup alert', function(data){
    	signuperror(data);    	 
    });

    socket.on('login alert', function(data){
    	loginerror(data);
    });

    socket.on('after login', function(data){
    	newuserjoined(data);
    });

    socket.on('signup done', function(){
    	showvalidating();
    });

});
