var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43841023-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function addTickets() {
	chrome.storage.sync.get('tickets', function(data){
		data['tickets'].forEach(function(counter) {
			var ticketStr = "ticket"+counter+"_ticket";		
			var keys = [ticketStr];
			chrome.storage.sync.get(keys, function(login_data) {
				detail = login_data[ticketStr];
				addHtml(detail, counter);
			});
		});
	});
	function addHtml(detail, counter) {
		currHtml = "<a href='ticket.html?ticket="+counter+"'><table style='width:100%;margin-bottom:0px' class='table table-striped'><tr>";
		currHtml += "<td>"+counter+"</td><td>"+detail['source']+"</td><td>"+detail['destination']+"</td><td>"+detail['date']+"</td><td>"+detail['trainNo']+"</td><td>"+detail['class'].substring(0,2)+"</td>"
		currHtml += "</tr></table>";
		document.getElementById('tickets').innerHTML += currHtml;	
	}
}

$(document).ready(function() {
    addTickets();
	$("#clearTicket").click(function(){
		chrome.storage.local.remove('bookticket', function() {
		});		
	});	
	$(".ticket").on('click',function(){
			alert("dsgdfg");
			//window.location = "ticket.html?ticket="+$(this).attr('counter');
	});
});
