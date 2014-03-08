/*document.addEventListener('DOMContentLoaded', function () {
  console.log("loaded");
  chrome.alarms.create('refresh', {periodInMinutes: 0.1});
  chrome.alarms.onAlarm.addListener(onAlarm);
});*/
init();
var MESSAGE_LIST_URL = "http://www.cc98.org/usersms.asp?action=inbox";
var MESSAGE_CONTENT_URL = "http://www.cc98.org/messanger.asp?action=read&id=";
function init(){
	console.log ('Init start.');
	chrome.alarms.onAlarm.addListener(onAlarm);
	chrome.alarms.create('refresh', {periodInMinutes: 0.1});
}

function onAlarm(alarm) {
	console.log ('Got alarm', alarm);
	htmlobj=$.ajax({url:MESSAGE_LIST_URL,async:false});
	pmListHtml = htmlobj.responseText;
	//console.log(pmListHtml);
	indexOfUnreed = pmListHtml.indexOf('条未读消息');
	console.log (indexOfUnreed);
	if (indexOfUnreed > 0 ) {
		unreedNum = parseInt(pmListHtml.substr(indexOfUnreed - 1, 1));
		console.log('Notify some unreed messages. Number: ' + unreedNum);
		onUnreedDetected(unreedNum, pmListHtml);
	}	
	//var index = htmlobj.indexOf('未读消息')
/*	if ( index > 0 ) {
		console.log (index); 
	}*/
	//console.log (htmlobj.responseText);
}

function onUnreedDetected (unreedNum, pmListHtml){
	console.log ('onUnreedDetected start.');
	messageIdList = pmListHtml.match(/name=id value=\d+/g);
	console.log (messageIdList);
	for (i = 0; i < unreedNum; i++){
		processUnreedId = parseInt(messageIdList[i].substr(14));
		console.log(processUnreedId);
		messageContentHtml = $.ajax({url:MESSAGE_CONTENT_URL + processUnreedId,async:false}).responseText;
		messageTitle = messageContentHtml.match(/消息标题：.+(?=<\/b>)/g)[0].substr(5);
		messageContent = messageContentHtml.match(/<span id="ubbcode1" >.+(?=<\/span)/g)[0].substr(21);
		messageSender = messageContentHtml.match(/<b>\S+(?=<)/g)[0].substr(3);
		console.log('message title:' + messageTitle);
		console.log('message content:' + messageContent);
		console.log('message sender:' + messageSender);
		opt = {
			type:"basic",
			title: '收到一条来自 ' + messageSender + '的新消息',
			message: '标题：' +  messageTitle + '\r\n内容：' + messageContent,
			iconUrl: "http://www.cc98.org/favicon.ico"
		}
		chrome.notifications.create('', opt, function(){});
	}

}