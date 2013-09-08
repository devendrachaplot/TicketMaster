function load_data(counter) {
	var loginStr = "ticket"+counter+"_login";
	var ticketStr = "ticket"+counter+"_ticket";
	var passStr = "ticket"+counter+"_pass";
	get_login();
	
	function get_login() {
		chrome.storage.sync.get(loginStr, function(login_data) {
			console.log("The login data is: ");
			console.log(login_data);
			get_ticket();
		});
	}
	function get_ticket() {
		chrome.storage.sync.get(ticketStr, function(ticket_data) {
			console.log("The ticket data is: ");
			console.log(ticket_data);
			get_passengers();
		});
	}
	function get_passengers() {
		chrome.storage.sync.get(passStr, function(pass_data) {
			console.log("The passenger data is: ");
			console.log(pass_data);
		});
	}
}

$(document).ready(function() {
	$("#submit").click(function() {
		var number = $("#ticketNumber").val();
		load_data(number);
	});
});