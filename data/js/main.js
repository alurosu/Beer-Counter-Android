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
	$('#priceUnit').val(localStorage.price);
	$('#price2drink_input').val(localStorage.price);
	
	if (!localStorage.currency)
		localStorage.currency = '€';
	$("#priceCurrency").val(localStorage.currency);
	
	$('#price2drink span').html(localStorage.price + ' ' + localStorage.currency);
	
	if (!localStorage.totalPrice)
		localStorage.totalPrice = 0;
	
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
		if ($(this).val()) {
			localStorage.currency = $(this).val();
			updateTotal();
		}
	});
	
	$('#priceUnit').change(function() {	
		if ($.isNumeric($(this).val()) && $(this).val()>0) {	
			localStorage.price = $(this).val();
			
			$('#price2drink_input').val(localStorage.price);
			$('#price2drink span').html(localStorage.price + ' ' + localStorage.currency);
		}	
	});
	
	$('#sound input').on('click', function(){
		$('#sound input').prop('checked', false).checkboxradio('refresh');
		$(this).prop('checked',true).checkboxradio('refresh');
		localStorage.sound = $(this).val();
	});
	
	$('.priceSuggestions a').on('click', function(){
		var tempCurrency = $(this).html();
		$('#priceCurrency').val(tempCurrency);
		localStorage.currency = tempCurrency;
		updateTotal();
	});
	
	// other funtions
	$('#counter').html(localStorage.beers);
	updateTotal();
}

$(document).ready(function(e) {	
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
	
	$('#price2drink').on("click",function(e) {
		$.mobile.changePage("#price2drink_dialog", { role: "dialog" });
	});
	
	$('#counter').on("click",function(e) {
		if (localStorage.beers)
			localStorage.beers = parseInt(localStorage.beers) + 1;
		else 
			localStorage.beers = 1;
		
		localStorage.totalPrice = parseFloat(localStorage.totalPrice) + parseFloat(localStorage.price);
		
		startUndoTimer();
		
		$(this).html(localStorage.beers);
		updateTotal();
		
		generateNotification();
		playAudio(localStorage.sound);
		
		if (localStorage.vibrate == 1)
			navigator.notification.vibrate(250);
	});
	
	$('#undo').on("click",function(e) {
		localStorage.beers = parseInt(localStorage.beers) - 1;
		localStorage.totalPrice = parseFloat(localStorage.totalPrice) - parseFloat(localStorage.price);
		
		$('#counter').html(localStorage.beers);
		updateTotal();
		
		undoTimerCancel = true;
		$('#undo').fadeOut(0);
	});
	
	$('#openDialog').on("click",function(e) {
		$('#saveName').val("Party on " + today());
	});
});

$(document).on("pageshow","#history",function(){
	getHistory();
});

function startUndoTimer() {
	$('#undo').fadeIn();
	undoTimer();
}
var undoTimerCount = 5;
var undoTimerCancel = false;
function undoTimer() {
	if (undoTimerCount>0 && undoTimerCancel != true) {
		$('#undo span').html(undoTimerCount+'s');
		undoTimerCount--;
		
		setTimeout(function() {
			undoTimer();
		}, 1000);
	} else {
		undoTimerCount = 5;
		undoTimerCancel = false;
		$('#undo').fadeOut();
	}
}

function getHistory() {
	if (!localStorage.history)
		content = '<li>Your history is empty.</li>';
	else {
		var history = JSON.parse(localStorage.history); // read
		var content = "";
		
		var addS;
		for (i=0; i<history.length; i++) {
			addS = 's';
			if (history[i].beers == 1)
				addS = '';
			content = '<li><div class="title">' + history[i].title + '</div> &bull; ' + history[i].beers + ' drink' + addS + ' for ' + history[i].price + '</li>' + content;
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
		
	history.push({'title' : $('#saveName').val(), 'beers' : localStorage.beers, 'price' : (Math.round(localStorage.totalPrice * 100) / 100) + ' ' +  localStorage.currency});
	localStorage.history = JSON.stringify(history); // write
	
	clearCounter("#history");
}

function clearCounter(page) {
	localStorage.beers = 0;
	localStorage.totalPrice = 0;
	$('#counter').html(0);
	updateTotal();
	generateNotification();
	
	if (page)
		$.mobile.changePage(page, { transition: "fade", changeHash: false });
	else
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
	$.mobile.changePage( "#history", { transition: "fade", changeHash: false });
}

function updateTotal() {
	var number = Math.round(localStorage.totalPrice * 100) / 100;
	$("#totalPrice").html("Total: <span>" + number + " </span>" + localStorage.currency);
}

function savePrice2Drink() {
	var temp = $('#price2drink_input').val();
	if ($.isNumeric(temp) && temp>0) {	
		localStorage.price = temp;
		
		$('#priceUnit').val(localStorage.price);
		$('#price2drink span').html(localStorage.price + ' ' + localStorage.currency);
	}
	
	$.mobile.changePage("#main");
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