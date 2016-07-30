var onPageReady = function (argument) {
	$.get('/balances', function(data){
		var balances = data;
		$('#current-balance').html(balances[0].income - balances[0].expense);
		$('#total-incomes').html(balances[0].income);
		$('#total-expenses').html(balances[0].expense);
		$('#yearly-turnover').html(balances[0].turnover);
	});
	var request = new XMLHttpRequest;
	request.open('GET', '/dashboard', true);
	request.onload = function(){
	  var username= request.getResponseHeader('x-user');
	  $('#logged-in-user-name').html(username);
	};
	request.send();


}

$(document).ready(onPageReady);
