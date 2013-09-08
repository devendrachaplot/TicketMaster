//var elem = document.getElementById('submit');
//elem.addEventListener('click', saveform(), false);
//elem.onclick(saveform());

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43841023-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
/*
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-43841023-1', 'ticketmaster.com');
  ga('send', 'pageview');

*/

fields = 2;
function addInput() {
	if (fields != 7) {
		document.getElementById('table').innerHTML += "<tr><td> <input  type='text' name='name[]' onBlur='updateDOM(this)' maxlength='16' /> </td><td> <select name='gender[]' onBlur='updateDOM(this)' > <option selected>Male</option> <option>Female</option></select></td> <td> <input type='text' name='age[]' onBlur='updateDOM(this)' maxlength='3'/> </td><td> <select name='berth[]' onBlur='updateDOM(this)'><option selected>Lower</option><option>Middle</option><option>Upper</option><option>Side Upper</option><option>Side Lower</option></select> </td><td> <input type='checkbox' name='senior[]' onBlur='updateDOM(this)' /></td><td> <input type='button' class='remove_button' value='-' /> </td></tr>";
		fields += 1;
		document.getElementById('id').value=fields;
	} else {
		document.getElementById('add_button').disabled=true;
	}
}

function removeFormField(src) {
	if(fields > 1) {
		var row = $(src).parent().parent();
		row.parent().removeChild(row);
		fields -= 1;
		document.getElementById('add_button').disabled=false;
	}
}
  
function updateDOM(inputField) {
	// if the inputField ID string has been passed in, get the inputField object
	if (typeof inputField == "string") {
		inputField = document.getElementById(inputField);
	}
	inputField.setAttribute("value",inputField.value);
}

function validate() {
	var myform = document.forms["form1"];
	//formName being the name of the form
	for (i = 0; i < myform.length; i++) {
		inp= myform.elements[i];
		if(inp.type=="text" || inp.type=="password") {
			if (inp.value.length == 0){
					if (inp.name=="name[]") {
						alert("Please enter the name of guest");
					} else if (inp.name=="age[]") {
						alert("Please enter the age of guest");
					} else if (inp.name=="rel[]") {
						alert("Please enter the relationship with guest");
					} else {
						alert("Please enter value in field : " + inp.name);
					}
				return false;
			}
		}
	}
}

function savedata(counter, callback) {
		var login_data = $('#login_data').serializeArray();
		var ticket_data = $('#ticket_data').serializeArray();
		var pass1 = $('#pass1').serializeArray();	
		var pass2 = $('#pass2').serializeArray();
		var pass3 = $('#pass3').serializeArray();
		var pass4 = $('#pass4').serializeArray();
		var pass5 = $('#pass5').serializeArray();
		var pass6 = $('#pass6').serializeArray();
	
		var loginStr = 'ticket'+counter+'_login';
		login_format_data = get_login_array(login_data);
		var ticketStr = "ticket"+counter+"_ticket";
		ticket_format_data = get_ticket_array(ticket_data);
		var passStr = "ticket"+counter+"_pass";
		pass_format_data = get_passenger_array(pass1, pass2, pass3, pass4, pass5, pass6);
		
		var data = {};
		data[loginStr] = login_format_data;
		data[ticketStr] = ticket_format_data;
		data[passStr] = pass_format_data;
		
		chrome.storage.sync.set(data, function() {
			callback();
		});		
}
		
function saveform() {
	function storedata(counter){
		savedata(counter,function(){
			chrome.storage.sync.get('tickets',function(data){
				data['tickets'].push(counter);
				chrome.storage.sync.set({'tickets': data['tickets']}, function() {
					counter++;
					chrome.storage.sync.set({'ticketcounter': counter}, function() {
						alert("Ticket Saved with number : "+(counter-1));
						window.location = "\index.html"
					});
				});			
			});
		});				
	}
	
	chrome.storage.sync.get('ticketcounter', function(counter) {
		if(counter['ticketcounter'] > 1) {			
			chrome.storage.sync.get('tickets',function(data){
				if(!$.isArray(data['tickets'])){
					chrome.storage.sync.set({'tickets': new Array()}, function() {
						storedata(counter['ticketcounter']);
					});
				}
				else{
					storedata(counter['ticketcounter']);
				}
			});
		} else {
			chrome.storage.sync.set({'ticketcounter': 1}, function() {
				counter = 1;				
				chrome.storage.sync.get('tickets',function(data){
					if(!$.isArray(data['tickets'])){
						chrome.storage.sync.set({'tickets': new Array()}, function() {
							storedata(counter);
						});
					}
					else{
						storedata(counter);
					}
				});
			});
		}	
	});
}

function get_login_array(login_array) {
	username = login_array.shift();
	password = login_array.shift();
	var login_detail = {
		"username": username.value,
		"password": password.value
	}
	return login_detail;
}

function get_ticket_array(ticket_array) {
	source = parseStation(ticket_array.shift().value);
	board_point = parseStation(ticket_array.shift().value);
	destination = parseStation(ticket_array.shift().value);
	date = ticket_array.shift();
	quota = ticket_array.shift();
	trainNo = parseStation(ticket_array.shift().value);
	class1 = ticket_array.shift();
	ticketType = ticket_array.shift();
	var ticket_detail = {
		"source": source,
		"boarding_point": board_point,
		"destination": destination,
		"date": date.value,
		"quota": quota.value,
		"trainNo": trainNo,
		"class": class1.value,
		"ticketType": ticketType.value
	}
	return ticket_detail;
}

function parseStation(nameString) {
	var code = nameString.split(' : ');
	return code[0];
}

function get_passenger_array(pass1, pass2, pass3, pass4, pass5, pass6) {
	pass1_json = get_passenger_json(pass1);
	pass2_json = get_passenger_json(pass2);
	pass3_json = get_passenger_json(pass3);
	pass4_json = get_passenger_json(pass4);
	pass5_json = get_passenger_json(pass5);
	pass6_json = get_passenger_json(pass6);
	var i = 1;
	var passengers = {};
	if(pass1_json != null) {
		passengers[i] = pass1_json;
		i++;
	}
	if(pass2_json != null) {
		passengers[i] = pass2_json;
		i++;
	}
	if(pass3_json != null) {
		passengers[i] = pass3_json;
		i++;
	}
	if(pass4_json != null) {
		passengers[i] = pass4_json;
		i++;
	}
	if(pass5_json != null) {
		passengers[i] = pass5_json;
		i++;
	}
	if(pass6_json != null) {
		passengers[i] = pass6_json;
		i++;
	}
	passengers['mobileNumber'] = $("input[name='mobileNumber']").val();
	/*var passengers = {
		1: pass1_json,
		2: pass2_json,
		3: pass3_json,
		4: pass4_json,
		5: pass5_json,
		6: pass6_json
	}*/
	return passengers;
}

function get_passenger_json(pass) {	
	passName = pass.shift();
	if(passName.value != "") {
		sex = pass.shift();
		age = pass.shift();
		berth_preference = pass.shift();
		food_preference = pass.shift();
		idCardType = pass.shift();
		idCardNo = pass.shift();
		senior_citizen = pass.shift();
		if(senior_citizen) {
			var ticket_detail = {
				"name": passName.value,
				"sex": sex.value,
				"age": age.value,
				"berth_preference": berth_preference.value,
				"food_preference" : food_preference.value,
				"senior_citizen": senior_citizen.value,
				"idCardType": idCardType.value,
				"idCardNo": idCardNo.value
			}
		} else {
			var ticket_detail = {
				"name": passName.value,
				"sex": sex.value,
				"age": age.value,
				"berth_preference": berth_preference.value,
				"food_preference" : food_preference.value,
				"senior_citizen": "off",
				"idCardType": idCardType.value,
				"idCardNo": idCardNo.value
			}
		}
		return ticket_detail;
	} else {
		return null;
	}
}

function fillForm(counter){
	var loginStr = 'ticket'+counter+'_login';	
	var ticketStr = "ticket"+counter+"_ticket";
	var passStr = "ticket"+counter+"_pass";
	var keys = [loginStr,ticketStr,passStr];
	chrome.storage.sync.get(keys, function(login_data) {			
		//console.log(login_data);
		user = login_data[loginStr];			
		ticketdetail = login_data[ticketStr];
		passdetail = login_data[passStr];
		$("#login_data #username").val(user['username']);
		$("#login_data #password").val(user['password']);
		$("#ticket_data #src").val(ticketdetail['source']);
		$("#ticket_data #dest").val(ticketdetail['destination']);
		$("#ticket_data #brdp").val(ticketdetail['boarding_point']);
		$("#ticket_data #book_date").val(ticketdetail['date']);
		$("#ticket_data #quota").val(ticketdetail['quota']);
		$("#ticket_data #trainNo").val(ticketdetail['trainNo']);
		$("#ticket_data #class").val(ticketdetail['class']);
		$("#ticket_data #ticketType").val(ticketdetail['ticketType']);
		for(var i in passdetail){
			if($.isNumeric(i)){				
				$("#row"+i+" input[name='name']").val(passdetail[i]['name']);
				$("#row"+i+" input[name='age']").val(passdetail[i]['age']);
				$("#row"+i+" select[name='gender']").val(passdetail[i]['sex']);
				$("#row"+i+" select[name='berth']").val(passdetail[i]['berth_preference']);
				$("#row"+i+" select[name='food']").val(passdetail[i]['food_preference']);
				$("#row"+i+" select[name='idCardType']").val(passdetail[i]['idCardType']);				
				$("#row"+i+" input[name='idCardNo']").val(passdetail[i]['idCardNo']);
				$("#row"+i+" input[name='senior']").prop('checked', (passdetail[i]['senior_citizen'] == "off")?false:true);
			}
		}
		$("input[name='mobileNumber']").val(passdetail['mobileNumber']);
	});
}

$(function() {
	$("#book_date").datepicker({
		changeMonth: true,
		changeYear: true,
		dateFormat: 'dd/m/yy',
		minDate: 0
	});
});

$(document).ready(function() {
	var counter = null;
	if(document.URL.match(/edit=([^&]+)/))
		counter = document.URL.match(/edit=([^&]+)/)[1];
	if(counter != null)
		fillForm(counter);
	$("#submit").click(function(){
		if(counter == null){
			saveform();		
		}
		else{
			savedata(counter,function(){alert("Ticket updated successfully");});			
		}		
	});
	$("#submit1").click(function(){
		if(counter == null)
			saveform();
		else{
			savedata(counter,function(){alert("Ticket updated successfully");});					
		}		
	});
	//$("#add_button").click(function() {addInput();});
	//$(".remove_button").click(function() {removeFormField(this);});	
});
