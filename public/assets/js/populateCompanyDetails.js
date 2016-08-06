var onPageReady = function (argument) {
	var companyNickName = $(location).attr('href').split('/')[4];

	$.get('/detail/'+companyNickName, function(data){
		console.log(data[0]);
		var companyDetail = data[0];
		$('#company-name').html(companyDetail.name);
		$('#address').html(companyDetail.address);
		$('#propietor-name').html(companyDetail.propeitor_name);
		$('#phone').html(companyDetail.phone_number);
	});
}

$(document).ready(onPageReady);
