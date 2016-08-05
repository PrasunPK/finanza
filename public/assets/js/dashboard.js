var onPageReady = function (argument) {
	$.get('/balances', function(data){
		var balances = data;
		$('#current-balance').html((balances[0].income - balances[0].expense) + ' &#x20b9;');
		$('#total-incomes').html(balances[0].income  + ' &#x20b9;');
		$('#total-expenses').html(balances[0].expense  + ' &#x20b9;');
		$('#yearly-turnover').html(balances[0].turnover  + ' &#x20b9;');
	});

	$.get('/companies', function(data){
		var listOfCompaniesHtml = "";
		data.forEach(function(company){
		 listOfCompaniesHtml +=	"<a href=\"/companies/" + company.name + "\" title=\" click here to view \">" 
            + "<div class=\"panel panel-primary\" id=\"company-name\">"
            + "<div class=\"panel-body\">" + company.name + "</div>"
            + "</div></a>"
		});
		$('#company-list').html(listOfCompaniesHtml);
	});

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
