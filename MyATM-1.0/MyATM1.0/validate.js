$(function(){
	var $window = $(window);
	var $otp = $('#otp');
	var $validate = $('#validateBTN');

	var socket = io();

	$('#validateBTN').click(function() {
		var otpvalidkey = $otp.val().trim();
		socket.emit('Signup Valid', otpvalidkey);
	});

	function newuserjoined (data) {
    	//getlocation();
    	window.location.href = '/mappage';

    }
	socket.on('after signup', function(data){
    	newuserjoined(data);
    });
});