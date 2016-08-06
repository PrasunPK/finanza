var onPageReady = function (argument) {
	var errorMessage = $(location).attr('href').split('=')[1].replace(/%20/g, ' ');
	if(errorMessage != null || errorMessage != undefined){
		console.log(errorMessage)
		$("#login-alert").attr('style','none');
		$("#login-alert").html(errorMessage);
	}
}

$(document).ready(onPageReady);
