// device APIs are available
function onDeviceReady() {
	if (!localStorage.beers)
		localStorage.beers = 0;
	
	if (!localStorage.vibrate)
		localStorage.vibrate = 1;
	if (!localStorage.sound)
		localStorage.sound = 'data/sounds/canOpen.mp3';
	if (!localStorage.price)
		localStorage.price = '1.5';
	if (!localStorage.currency)
		localStorage.currency = '€';
	
	if (localStorage.price) {
		$('#priceUnit').val(localStorage.price);
	}
	
	if (localStorage.currency) {
		$("#priceCurrency option").filter(function() {
			return $(this).val() == localStorage.currency; 
		}).attr('selected', true);
	}
	
	if (localStorage.sound) {
		$('#sound input[value="' + localStorage.sound + '"]').prop('checked',true);
	}
		
	if (localStorage.vibrate == 1)
		$('#vibrations').attr('checked','checked');
		else 
		$('#vibrations').removeAttr('checked');
		
	// settings functions
	$('#vibrations').change(function() {			
		if (localStorage.vibrate == 0) {
			localStorage.vibrate = 1;
			$('#vibrations').attr('checked','checked').flipswitch('refresh');
		} else  {
			localStorage.vibrate = 0;
			$('#vibrations').removeAttr('checked').flipswitch('refresh');
		}
	});
	
	$('#priceCurrency').change(function() {			
		localStorage.currency = $(this).val();
		updateTotal();		
	});
	
	$('#priceUnit').change(function() {	
		if ($.isNumeric($(this).val()) && $(this).val()>0)		
			localStorage.price = $(this).val();
			else
			$(this).val('1.5');
		updateTotal();		
	});
	
	$('#sound input').on('click', function(){
		$('#sound input').prop('checked', false).checkboxradio('refresh');
		$(this).prop('checked',true).checkboxradio('refresh');
		localStorage.sound = $(this).val();
	});	
	
	updateTotal();
}

$(document).ready(function(e) {
	// localStorage.clear();
	
	// panel functions
	$('#main').on("swipeleft", function(e) {
		$("#menu").panel("open");
	});
	
	$('#main').on("swiperight", function(e) {
		$("#menu").panel("close");
	});
	
	$('.menuTrigger').on("click",function(e) {
		$("#menu").panel("open");
	});
	
	$('#lastMenuItem').on("click",function(e) {
		$("#menu").panel("close");
	});
	
	// other funtions
	
	$('#counter').html(localStorage.beers);
	updateTotal();
	
	$('#counter').on("click",function(e) {
		var beers;
		if (localStorage.beers)
			beers = parseInt(localStorage.beers) + 1;
			else
			beers = 1;
			
		console.log('beers: ' + beers);
		localStorage.beers = beers;
			
		$(this).html(beers);
		updateTotal();
		generateNotification();
		playAudio(localStorage.sound);
		
		if (localStorage.vibrate == 1)
			navigator.notification.vibrate(250);
	});
		
	$('#counter').dblclick(function(e){
		e.preventDefault();
	});
	
	$('#openDialog').on("click",function(e) {
		$('#saveName').val("Party on " + today());
	});
});

$(document).on("pageshow","#history",function(){
	getHistory();
});

function getHistory() {
	if (!localStorage.history)
		content = '<li>Your history is empty.</li>';
	else {
		var history = JSON.parse(localStorage.history); // read
		var content = "";
		
		console.log("getHistory");
		console.log(history);
		
		var addS;
		for (i=0; i<history.length; i++) {
			addS = 's';
			if (history[i].beers == 1)
				addS = '';
			content = '<li><div class="title">' + history[i].title + '</div> &bull; ' + history[i].beers + ' beer' + addS + ' for ' + history[i].price + '</li>' + content;
		}
		
		if (i == 0)
			content = '<li>Your history is empty.</li>';
	}
	$('#historyList').html(content);
}

function saveCounter() {
	var history;
	if (localStorage.history)
		history = JSON.parse(localStorage.history); // read
		else
		history = [];
		
	
	var price = Math.round(localStorage.price * localStorage.beers * 100) / 100;
	history.push({'title' : $('#saveName').val(), 'beers' : localStorage.beers, 'price' : price + ' ' +  localStorage.currency});
	localStorage.history = JSON.stringify(history); // write
	
	localStorage.beers = 0;
	$('#counter').html(0);
	updateTotal();
	generateNotification();
	$("#dialog").dialog("close");
}

function clearCounter() {
	localStorage.beers = 0;
	$('#counter').html(0);
	updateTotal();
	generateNotification();
	$("#dialog").dialog("close");
}

function today() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	
	if(dd<10) {
			dd='0'+dd
	}
	
	if(mm<10) {
			mm='0'+mm
	} 
	
	return dd+'/'+mm+'/'+yyyy;
}

function playAudio(url) {
    // Play the audio file at url
	if (device.platform == 'Android') {
			url = '/android_asset/www/' + url;
	}
		
    var my_media = new Media(url,
        // success callback
        function () {
            console.log("playAudio():Audio Success");
        },
        // error callback
        function (err) {
            console.log("playAudio():Audio Error: " + err);
        }
    );
    // Play audio
    my_media.play();
}
function deleteHistory() {
	localStorage.history = JSON.stringify([]);
	$.mobile.changePage( "#history", { transition: "slide", changeHash: false });
}

function updateTotal() {
	var number = Math.round(localStorage.price * localStorage.beers * 100) / 100;
	$("#totalPrice").html("Total: <span>" + number + " </span>" + localStorage.currency);
}

function generateNotification() {
	var content ='Tap the circle after each beer. <span class="author">Beer Counter</span>';
	if (localStorage.beers>0)
		switch (Math.floor(Math.random() * 7)) {
			case 0:
					content = 'People who drink light &rsquo;beer&rsquo; don&rsquo;t like the taste of beer. They just like to pee alot.';
					break;
			case 1:
					content = 'A fine beer may be judged with only one sip, but it&rsquo;s better to be thoroughly sure.';
					break;
			case 2:
					content = 'Beer is proof that God loves us and wants us to be happy. <span class="author">Benjamin Franklin</span>';
					break;
			case 3:
					content = 'Beauty lies in the hands of the beer holder.';
					break;
			case 4:
					content = 'Tap the circle after each beer. <span class="author">Beer Counter</span>';
					break;
			case 5:
					content = 'Homer no function beer well without. <br/><span class="author">H. Simpsons</span>';
					break;
			case 6:
					content = 'Alcohol, the cause and solution to all of life&rsquo;s problems. <span class="author">H. Simpsons</span>';
					break;
			case 7:
					content = 'There are more old drunks than there are old doctors. <span class="author">Willie Nelson</span>';
					break;
		}
	$('#notification').html(content);
}