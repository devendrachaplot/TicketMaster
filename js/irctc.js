javascript:void(document.oncontextmenu=null);

var user = new Array();
var detail = new Array();
var ticketDetails = new Array();

chrome.storage.local.get('bookticket',function(data){
	if(data['bookticket'] > 0){
		var counter = data['bookticket'];
		var loginStr = 'ticket'+counter+'_login';		
		var ticketStr = "ticket"+counter+"_ticket";		
		var passStr = "ticket"+counter+"_pass";
		var keys = [loginStr,ticketStr,passStr];
		chrome.storage.sync.get(keys, function(login_data) {			
					//console.log(login_data);
					user = login_data[loginStr];			
					detail = login_data[ticketStr];
					ticketDetails = login_data[passStr];
					ticketDetails['boardPoint'] = detail['boarding_point'];
					bookTicket();
				});	
	}
})

function login(detail){
	$("input[name='userName']").val(detail['username']);
	$("input[name='password']").val(detail['password']);
	$("input#button").click();
}

function planMyTravel(detail){
	$("input[name='stationFrom']").val(detail['source']);
	$("input[name='stationTo']").val(detail['destination']);
	$("input[name='JDatee1']").val(detail['date']);
	var Date = detail['date'].split("/");
	$("select[name='day']").val(Date[0]);
	$("select[name='month']").val(Date[1]);
	$("select[name='year']").val(Date[2]);
	$("select[name='ticketType']").val('eticket');
	$("select[name='quota']").val(detail['quota']);
	$("#findTrain input").click();
}

function listOfTrains(detail){
	$('#plannerTrainListResult').parent().find('table > tbody  > tr').each(function() {
		// alert("check!");
		if($(this).find('td:first-child').html().search(detail['trainNo']) >= 0){
			$(this).find('td input[value="'+detail['class']+'"]').click();
			// alert("found!");
		}
	});
}
//listOfTrains(trainDetails);


function ticketConfirmation(detail){
	$("input[name='boardPoint1']").val(detail['boardPoint']);
	$("input[name='mobileNumber']").val(detail['mobileNumber']);
	for(var i in detail){
		if($.isNumeric(i)){
			var j = i-1;
			$("input[name='passengers["+j+"].passengerName']").val(detail[i]['name']);
			$("input[name='passengers["+j+"].passengerAge']").val(detail[i]['age']);
			$("select[name='passengers["+j+"].passengerSex']").val(detail[i]['sex']);
			$("select[name='passengers["+j+"].berthPreffer']").val(detail[i]['berth_preference']);
			$("select[name='passengers["+j+"].foodPreffer']").val(detail[i]['food_preference']);
			$("input[name='passengers["+j+"].seniorCitizen']").prop('checked', (detail[i]['senior_citizen'] == "off")?false:true);
			$("select[name='passengers["+j+"].idCardType']").val(detail[i]['idCardType']);
			$("input[name='passengers["+j+"].idCardNo']").val(detail[i]['idCardNo']);
		}
	}
}

function clickBook(){
	var timerbook = setInterval(function(){
		if(document.getElementById('submitButton0')){
			document.getElementById('submitButton0').click();
			clearInterval(timerbook);
		}
		if(document.documentElement.outerHTML.search("Session has Expired") >= 0)
			window.location.href="/";
		},1000);
}
//ticketConfirmation(ticketDetails);

// planMyTravel(detail);
function bookTicket(){
	if(document.documentElement.outerHTML.search("Session has Expired") >= 0 || document.documentElement.outerHTML.search("Online Reservation Error") >= 0 ){
		window.location.href="/";
	}
	else if(window.location.pathname.search('cgi-bin') < 0){
		login(user);
	}
	else if(window.location.pathname.search('planner.do') >= 0){
		var str = document.documentElement.outerHTML;
		if(str.search("<h3>Train Route</h3>") >= 0){
			alert("TicketMaster : Please select correct station codes and click on Book");
		}
		// else if($(".ErrorMsg").length > 0 && $(".welcomealert").length <= 0){
			// alert("Some error occurred, please check ticket details again");
		// }
		else if(str.search("<h3>&nbsp;List of Trains</h3>") < 0){
			planMyTravel(detail);
		}
		else{
			listOfTrains(detail);
			var str = document.documentElement.outerHTML;
			if(str.search(">Availability</div>") >= 0){
				//alert("asdasd");
				clickBook();
			}	
		}
	}
	else if(window.location.pathname.search('bookticket.do') >= 0){
		if($('input[value="Go"]').length > 0){
			ticketConfirmation(ticketDetails);
			var timercaptcha = setInterval(function(){			
				var value = captcha();				
				if(value != ""){
					$('input[name="captchaImage"]').val(value);				
					$('input[value="Go"]').click();
					//clearInterval(timercaptcha);
				}
			},500);
		}
		else{
			if($('#payButton').css('display') != 'none')
				$('input[value="Make Payment"]').click();
		}
	}
}

//bookTicket();