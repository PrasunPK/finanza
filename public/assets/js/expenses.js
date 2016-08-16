var onPageReady = function (argument) {
	$.get('/expenses', function(rows){
		var tableRow = "";
		rows.forEach(function(row){
			tableRow += "<tr><td>" + row.day + "-" + row.month + "-" + row.year + "</td><td>" + row.purpose + "</td><td>"
			+ row.category +"</td><td>"+ row.amount +"</td><td>"+ row.updated_by +"</td></tr>";
		});
		$('#previous-expenses').html(tableRow);
	});
	var clearData = function(){
		$('#amount').html('');
		$('#purpose').html('');
	 	$('#date-of-expense').reset('');
	}

	$(function(){
		$('#save').on('click', function(e){
			e.preventDefault();
			var amount = $('#amount').val();
			var purpose = $('#purpose').val();
			var category = $('#category').val();
			var date = $('#date-of-expense').val();

			var data = {date:date, purpose:purpose, category:category, amount:amount}
			$.post(this.href, data);
			$('#message').html('Saved!');
			clearData();
		});
	});
}

$(document).ready(onPageReady);

