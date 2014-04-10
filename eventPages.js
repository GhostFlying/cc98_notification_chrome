var MESSAGE_LIST_URL = "http://www.cc98.org/usersms.asp?action=inbox";
var MESSAGE_CONTENT_URL = "http://www.cc98.org/messanger.asp?action=read&id=";
var MESSAGE_INBOX_URL = "http://www.cc98.org/usersms.asp?action=inbox";

var lastShowedMessageId;
var lastClickedNotificationId;



init();

function init(){
	console.log ('Init start.');
	chrome.alarms.onAlarm.addListener(onAlarm);
	//chrome.alarms.create('refresh', {periodInMinutes: 0.1});
	chrome.browserAction.onClicked.addListener(goToInbox);

	lastShowedMessageId = localStorage.getItem('lastShowedMessageId');

	if (lastShowedMessageId == null) {
		console.log ("No lastShowedMessageId record.");
		lastShowedMessageId = 0;
	}
}

function goToInbox(){
	chrome.tabs.create({url:MESSAGE_INBOX_URL,active:true}, function(){});
	setTimeout(onAlarm,1000);
}

function switchUser() {

	lastShowedMessageId = 0;
	chrome.cookies.get({url:"http://www.cc98.org", name:"aspsky"}, function (cookie){    
	    if (cookie == null){
	    	cookieNow = null;
	    	console.log('Not log in.');
	    }
	    else {
	    	console.log(cookie);
	    	cookieOld = {
	  			url:"http://www.cc98.org",
	  			name:"aspsky",
	  			expirationDate:0,
	  			value:""
	  		} 
	  		cookieOld.value = cookie.value;
	  		cookieOld.expirationDate = cookie.expirationDate;  
	    }

	    cookieNew = {
  			url:"http://www.cc98.org",
  			name:"aspsky",
  			value:""
  		}

  		chrome.storage.sync.get("checkerList",function (item){
  			$.each(item.checkerList, function(index, value) {
  				cookieNew.value = value;
  				chrome.cookies.set(cookieNew);
  				username = value.match(/username=.+(?=&usercookies)/g)[0].substr(9);
  				onAlarm("switch to " + username);
  			});
  		});
  	});
}

function onAlarm(alarm) {
	console.log ('Got alarm', alarm);
	chrome.cookies.get({url:"http://www.cc98.org", name:"cc98Simple"}, function (cookie){
		if (cookie == null) {
			cookieSimple = {
				url: "http://www.cc98.org",
				name: "cc98Simple",
				value: "0"
			}
			chrome.cookies.set(cookieSimple);
		}
		else {
			checkIsSimple(cookie);
		}
		
	});
}

function checkIsSimple(cookie) {
	//console.log(cookie);
	if (cookie.value == '0'){
		console.log('Full version.');
		getUnreedNum(true);
	}
	else {
		console.log('Simple version.')
		getUnreedNum(false);
	}

}

function getUnreedNum(isFull){
	htmlobj=$.ajax({url:MESSAGE_LIST_URL,async:false});
	pmListHtml = htmlobj.responseText;
	if (isFull){
		indexOfUnreed = pmListHtml.indexOf(' 新</span></a>)');
	}
	else {
		indexOfUnreed = pmListHtml.indexOf('条未读消息');
	}	
	//console.log (indexOfUnreed);
	if (indexOfUnreed > 0 ) {
		unreedNum = parseInt(pmListHtml.substr(indexOfUnreed - 1, 1));
		console.log('Notify some unreed messages. Number: ' + unreedNum);
		chrome.browserAction.setBadgeText({text:unreedNum.toString()});
		onUnreedDetected(isFull, unreedNum, pmListHtml);
	}
	else {
		chrome.browserAction.setBadgeText({text:""});
	}
}

function onUnreedDetected (isFull, unreedNum, pmListHtml){
	console.log ('onUnreedDetected start.IsFull ' + isFull);

	messageIdList = pmListHtml.match(/name=id value=\d+/g);
	messageSenders = pmListHtml.match(/target="_blank">.+(?=<\/a>)/g);
	if (isFull){
		messageTitles = pmListHtml.match(/.+(?=<\/a><\/td>)/g);		
		for (i = 0; i < unreedNum; i++){
			messageTitles[i] = messageTitles[i*2].substr(5).replace(/&nbsp;/g,' ');
		}
	}
	else {
		messageTitles = pmListHtml.match(/\n\s{4}>.+(?=<\/a><\/td>)/g);
		for (i = 0; i < unreedNum; i++){
			messageTitles[i] = messageTitles[i].substr(6).replace(/&nbsp;/g,' ');
		}
	}
	for (i = 0; i < unreedNum; i++){
		messageIdList[i] = messageIdList[i].substr(14);
		messageSenders[i] = messageSenders[i+2].substr(16);
	}
	for (i = unreedNum - 1; i > -1; i--){
		messageId = messageIdList[i];
		if (messageId > lastShowedMessageId) {
			console.log ('New Message.');
			messageTitle = messageTitles[i];
			messageSender = messageSenders[i];
			opt = {
				type:"basic",
				title: '收到一条来自  ' + messageSender + '  的新消息',
				message: '标题：' +  messageTitle,
				iconUrl: "http://www.cc98.org/favicon.ico"
			}
			console.log ('start notification' + messageId);
			chrome.notifications.create('message' + messageId, opt, function(){});
			chrome.notifications.onClicked.addListener(onNotificationClicked);
			lastShowedMessageId = messageId;
		}
		else {
			console.log ('Old Message.');
		}

	}
	localStorage.setItem('lastShowedMessageId', lastShowedMessageId);

}

function onNotificationClicked (notificationId){
	console.log('notification' + notificationId + 'clicked.');
	if (lastClickedNotificationId != notificationId) {
		chrome.tabs.create({url: MESSAGE_CONTENT_URL + notificationId.substr(7),active:true}, function(){});
		setTimeout(onAlarm,1000);
	}
	lastClickedNotificationId = notificationId;	
}