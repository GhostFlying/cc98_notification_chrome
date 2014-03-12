init();
var MESSAGE_LIST_URL = "http://www.cc98.org/usersms.asp?action=inbox";
var MESSAGE_CONTENT_URL = "http://www.cc98.org/messanger.asp?action=read&id=";
var MESSAGE_INBOX_URL = "http://www.cc98.org/usersms.asp?action=inbox";

var lastShowedMessageId;

function init(){
	console.log ('Init start.');
	chrome.alarms.onAlarm.addListener(onAlarm);
	chrome.alarms.create('refresh', {periodInMinutes: 5});
	chrome.browserAction.onClicked.addListener(goToInbox);

	lastShowedMessageId = localStorage.getItem('lastShowedMessageId');

	if (lastShowedMessageId == null) {
		console.log ("No lastShowedMessageId record.");
		lastShowedMessageId = 0;
	}
}

function goToInbox(){
	chrome.tabs.create({url:MESSAGE_INBOX_URL,active:true}, function(){})
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
	if (cookie.value == '0'){
		console.log('Full version.');

		cookieNew = {
			url: "http://www.cc98.org",
			name: cookie.name,
			value: "1"
		}
		chrome.cookies.set(cookieNew);
		console.log('Changed to Simple.');
		getUnreedNum();
		cookieNew.value = '0';
		chrome.cookies.set(cookieNew);
		console.log('Changed to Full.');
	}
	else {
		console.log('Simple version.')
		getUnreedNum();
	}

}

function getUnreedNum(){
	htmlobj=$.ajax({url:MESSAGE_LIST_URL,async:false});
	pmListHtml = htmlobj.responseText;
	indexOfUnreed = pmListHtml.indexOf('条未读消息');
	if (indexOfUnreed > 0 ) {
		unreedNum = parseInt(pmListHtml.substr(indexOfUnreed - 1, 1));
		console.log('Notify some unreed messages. Number: ' + unreedNum);
		chrome.browserAction.setBadgeText({text:unreedNum.toString()});
		onUnreedDetected(unreedNum, pmListHtml);
	}
	else {
		chrome.browserAction.setBadgeText({text:""});
	}
}

function onUnreedDetected (unreedNum, pmListHtml){
	console.log ('onUnreedDetected start.');
	messageIdList = pmListHtml.match(/name=id value=\d+/g);
	//console.log (messageIdList);
	messageTitles = pmListHtml.match(/\n\s{4}>.+(?=<\/a><\/td>)/g);
	messageSenders = pmListHtml.match(/target=_blank>.+(?=<\/a>)/g);	
	for (i = unreedNum - 1; i > -1; i--){
		messageId = messageIdList[i].substr(14);
		if (messageId > lastShowedMessageId) {
			console.log ('New Message.');
			messageTitle = messageTitles[i].substr(5).replace(/&nbsp;/g,' ');
			messageSender = messageSenders[i*2].substr(14);
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
	chrome.tabs.create({url: MESSAGE_CONTENT_URL + notificationId.substr(7),active:true}, function(){});

}