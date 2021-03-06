var MESSAGE_LIST_URL = "http://www.cc98.org/usersms.asp?action=inbox";
var MESSAGE_CONTENT_URL = "http://www.cc98.org/messanger.asp?action=read&id=";
var MESSAGE_INBOX_URL = "http://www.cc98.org/usersms.asp?action=inbox";
var DISPUSER_URL = "http://www.cc98.org/dispuser.asp?name=";

var lastShowedMessageIdArray;
var lastClickedNotificationId;
var checkUserTotal = 0;
var checkUserCount = 0;


init();

init();

function init(){
	console.log ('Init start.');
	chrome.alarms.onAlarm.addListener(onAlarm);
	chrome.alarms.create('refresh', {periodInMinutes: 5});
	chrome.browserAction.onClicked.addListener(goToInbox);
	lastShowedMessageIdArray = JSON.parse(localStorage.getItem('lastShowedMessageIdArray'));
	//lastShowedMessageIdArray = null;//for debug.
	if (lastShowedMessageIdArray == null) {
		console.log ("No lastShowedMessageIdArray record.");
		lastShowedMessageIdArray = new Array();
	}
}

function goToInbox(){
	chrome.tabs.create({url:MESSAGE_INBOX_URL,active:true}, function(){});
	setTimeout(onAlarm,1000);
}

function switchUser(cookieNow, cookieSwitchValue) {
	username = cookieSwitchValue.match(/username=.+(?=&usercookies)/g)[0].substr(9);
	console.log('switchUser to ' + username);
	//console.log (cookieNow);
	//backup the original cookie.
	cookieOriginal = {
		url:"http://www.cc98.org",
		expirationDate:0,
		name:"aspsky",
		value:""
	}
	cookieOriginal.value = cookieNow.value;
	cookieOriginal.expirationDate = cookieNow.expirationDate;
	//setup the new cookie.
	var cookieToSwitch = {};
	$.extend(cookieToSwitch, cookieOriginal);	
	//cookieToSwitch = cookieOriginal;
	cookieToSwitch.value = cookieSwitchValue;
	//switch the cookie.
	chrome.cookies.set(cookieToSwitch);	
	return cookieOriginal;
}

function onAlarm(alarm) {
	console.log ('Got alarm', alarm);
	chrome.cookies.get({url:"http://www.cc98.org", name:"cc98Simple"}, function (cookie){
		chrome.cookies.get({url:"http://www.cc98.org", name:"aspsky"}, function(cookieLog){
			var unreedNumberTotal = 0;
			//step 1 check the user now login.
			var isFull = true;
			var username = '';
			if (cookie == null) {
				cookieFull = {
					url: "http://www.cc98.org",
					name: "cc98Simple",
					value: "0"
				}
				chrome.cookies.set(cookieFull);
				//getUnreedNum(false);
			}			
			else {
				isFull = checkIsFull(cookie);
			}
			pmListHtml = getpmListHtml();
			unreedNumber = getUnreedNum(isFull, pmListHtml);	
			username = cookieLog.value.match(/username=.+(?=&usercookies)/g)[0].substr(9);		
			if (unreedNumber > 0 ) {
				unreedNumberTotal = unreedNumber;				
				onUnreedDetected(isFull, unreedNumber, pmListHtml, username);
			}		

			//step 2 check the user in the list.
			//console.log (cookieLog.value);
			chrome.storage.sync.get("checkerList",function (item){
				checkerList = item.checkerList;
				checkUserTotal = checkerList.length;
				if (checkUserTotal == 0){
					return;
				}
				if (checkUserCount >= checkUserTotal) {
					checkUserCount = 0;
				}								
				usernameNew = checkerList[checkUserCount].match(/username=.+(?=&usercookies)/g)[0].substr(9);
				if (usernameNew == username) {
					checkUserCount = checkUserCount +1;
					console.log ('same user.');
					return;
				}
				cookieOriginal = switchUser(cookieLog, checkerList[checkUserCount]);
				checkUserCount = checkUserCount + 1;
				pmListHtml = getpmListHtml(isFull);
				unreedNumber = getUnreedNum(isFull, pmListHtml);								
				if (unreedNumber > 0) {
					unreedNumberTotal = unreedNumberTotal + unreedNumber;
					onUnreedDetected(isFull, unreedNumber, pmListHtml, usernameNew);
				}		
				console.log ('Switch back to origin.');
				chrome.cookies.set(cookieOriginal);
				if (unreedNumberTotal > 0) {
					chrome.browserAction.setBadgeText({text:(unreedNumberTotal - unreedNumber).toString() + '/' +unreedNumberTotal.toString()});
				}
				else {
					chrome.browserAction.setBadgeText({text:''});
				}			
			});
		});	
	});
}


function getUserAvatar(username) {
	htmlobj = $.ajax({url:DISPUSER_URL + username,async:false});
	dispuserHtml = htmlobj.responseText;
	avatarUrl = dispuserHtml.match(/<img src='.+(?=' width=')/g)[0].substr(10);	
	if (avatarUrl.indexOf('file.cc98.org') < 0) {
		avatarUrl = 'http://www.cc98.org/' + avatarUrl;
	}
	return avatarUrl;
}

function checkIsFull(cookie) {
	//console.log(cookie);

	if (cookie.value == '0'){
		console.log('Full version.');
		//getUnreedNum(true);
		return true;
	}
	else {
		console.log('Simple version.')
		//getUnreedNum(false);
		return false;
	}

}

function getpmListHtml () {
	htmlobj = $.ajax({url:MESSAGE_LIST_URL,async:false});
	pmListHtml = htmlobj.responseText;

	return pmListHtml;
}

function getUnreedNum(isFull, pmListHtml){	
	if (isFull){
		indexOfUnreed = pmListHtml.indexOf(' 新</span></a>)');
	}
	else {
		indexOfUnreed = pmListHtml.indexOf('条未读消息');
	}
	if (indexOfUnreed > 0 ) {
		unreedNum = parseInt(pmListHtml.substr(indexOfUnreed - 1, 1));
		console.log('Notify some unreed messages. Number: ' + unreedNum);
		return unreedNum;
		//chrome.browserAction.setBadgeText({text:unreedNum.toString()});
		//onUnreedDetected(isFull, unreedNum, pmListHtml);
	}
	else {
		console.log ('No unreed message.');
		return 0;
		//chrome.browserAction.setBadgeText({text:""});
	}
}

function onUnreedDetected (isFull, unreedNum, pmListHtml, username){
	console.log ('onUnreedDetected start.IsFull ' + isFull + '. username: ' + username);

	messageIdList = pmListHtml.match(/name=id value=\d+/g);
	messageSenders = pmListHtml.match(/target="_blank">.+(?=<\/a>)/g);

	
	lastShowedMessageId = 0;
	userIndex = -1;
	avatarUrl = '';
	console.log (lastShowedMessageIdArray);
	$.each(lastShowedMessageIdArray, function(index, value) {
		console.log (value);
		if (value.name == username) {
			lastShowedMessageId = value.lastShowedMessageId;
			userIndex = index;
			avatarUrl = value.avatarUrl;
			return;
		}		
	});
	if (avatarUrl == '') {
		avatarUrl = getUserAvatar(username);
	}

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
				iconUrl: avatarUrl
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
	//localStorage.setItem('lastShowedMessageId', lastShowedMessageId);
	if (userIndex < 0){
		user = {
			name:username,
			lastShowedMessageId:0,
			avatarUrl:avatarUrl
		}
		user.lastShowedMessageId = lastShowedMessageId;
		lastShowedMessageIdArray.push(user);
	}
	else {
		lastShowedMessageIdArray[userIndex].lastShowedMessageId = lastShowedMessageId;
	}		
	localStorage.setItem('lastShowedMessageIdArray', JSON.stringify(lastShowedMessageIdArray));
}

function onNotificationClicked (notificationId){
	console.log('notification' + notificationId + 'clicked.');
	if (lastClickedNotificationId != notificationId) {
		chrome.tabs.create({url: MESSAGE_CONTENT_URL + notificationId.substr(7),active:true}, function(){});
		setTimeout(onAlarm,1000);
	}
	lastClickedNotificationId = notificationId;	
}