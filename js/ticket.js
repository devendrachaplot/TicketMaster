//var counter = jQuery.url.param("ticket");
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43841023-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var counter;
var user = new Array();
	var detail = new Array();
	var ticketDetails = new Array();

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function updateHtml() {
	var html1 = "<table><tr><td>Username:</td><td>"+user['username']+"</td></tr>";
	html1 += "<tr><td>Soruce:</td><td>"+detail['source']+"</td></tr>";
	html1 += "<tr><td>Destination:</td><td>"+detail['destination']+"</td></tr>";
	html1 += "<tr><td>Date:</td><td>"+detail['date']+"</td></tr>";
	html1 += "<tr><td>Train No:</td><td>"+detail['trainNo']+"</td></tr>";
	html1 += "<tr><td>Class:</td><td>"+detail['class']+"</td></tr>";	
	for(var i in ticketDetails){
		if($.isNumeric(i))
			html1 += "<tr><td>Passenger "+i+":</td><td>"+ticketDetails[i]['name']+" -- "+ticketDetails[i]['sex']+" -- "+ticketDetails[i]['age']+" -- "+ticketDetails[i]['berth_preference']+"</td></tr>";		
	}
	html1 += "</table>";
	$("#displayArea").html(html1);
}

$(document).ready(function() {
	counter = getURLParameter("ticket");
	console.log(counter);

	var loginStr = 'ticket'+counter+'_login';		
	var ticketStr = "ticket"+counter+"_ticket";		
	var passStr = "ticket"+counter+"_pass";
	var keys = [loginStr,ticketStr,passStr];
	chrome.storage.sync.get(keys, function(login_data) {			
		user = login_data[loginStr];			
		detail = login_data[ticketStr];
		ticketDetails = login_data[passStr];
		ticketDetails['boardPoint'] = detail['boarding_point'];
		updateHtml();
	});
		
    $("#editTicket").click(function(){
		var win = window.open("/index.html?edit="+counter,'_blank');
		
	});
	
	$("#book").click(function(){
		chrome.storage.local.set({'bookticket': counter}, function() {
			window.open("https://www.irctc.co.in",'_blank'); 
		});
		//localStorage.setItem('bookticket',counter);
	});
	
	$("#removeTicket").click(function(){
		var loginStr = 'ticket'+counter+'_login';		
		var ticketStr = "ticket"+counter+"_ticket";		
		var passStr = "ticket"+counter+"_pass";
		var keys = [loginStr,ticketStr,passStr];
		chrome.storage.sync.remove(keys, function() {			
			chrome.storage.sync.get('tickets',function(data){
				var index = data['tickets'].indexOf(counter);
				data['tickets'].splice(index, 1);
				chrome.storage.sync.set({'tickets': data['ticekts']}, function() {
					window.location = "popup.html";
				});
			});
		});
	});
});
