var onPageReady = function (argument) {
	var request = new XMLHttpRequest;
	request.open('GET', '/header', true);
	request.onload = function(){
	  var username= request.getResponseHeader('x-user');
	  var role= request.getResponseHeader('x-role');
	  $('#logged-in-user-name').html(username);
	  $('#role').html(role);
	};
	request.send();
}

$(document).ready(onPageReady);