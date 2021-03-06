﻿/*var titleMax = 0;

function appendToBody (table) {
  $("body").append(table);
}

function getAllUnreed () {
  messagesJson = localStorage.getItem('messages');
  messages = JSON.parse(messagesJson);

  return messages;
}

function initTable() {
  table = $("<table></table>");
  tableTitle = $("<tr></tr>").append($("<th></th>").text("Sender"), $("<th></th>").text("Title"));
  table.append(tableTitle);
  return table;
}

function putMessagesToTable(messages, table) {
  $.each(messages, function(key,message){
    tileCol = $("<th></th>").text(message.title);
    senderCol = $("<th></th>").text(message.sender);
    messageRow = $("<tr></tr>").append(senderCol, tileCol);
    table.append(messageRow);
    if (titleMax < message.title.length){
      titleMax = message.title.length;
    }
  });

  return table;
}*/

function setStyle(width) {
  $("body").css('min-width', width + 'px');
}

function putMessages() {
  messages = [];

  for (i=0 ; i < 20; i++){
    oneMessage = {
      sender: 'sender' + i,
      title: 'title' + i
    }
    messages.push(oneMessage);
  }

  divTitle = $('<div></div>');
  senderTitle = $('<div></div>').text('来自');
  titleTitle = $('<div></div>').text('主题');

  divTitle.addClass('message');
  senderTitle.addClass('sendertitle');
  titleTitle.addClass('titletitle');

  divTitle.append(senderTitle,titleTitle);
  $('body').append(divTitle);

  $.each(messages, function(index, message){
    messageDiv = $('<div></div>');
    messageDiv.attr('id', 'message' + index);
    messageDiv.addClass('message');

    senderDiv = $('<div></div>').text(message.sender);
    senderDiv.addClass('sender');

    titleDiv = $('<div></div>').text(message.title);
    titleDiv.addClass('title');

    messageDiv.append(senderDiv, titleDiv);

    spitLine = $('<hr>');
    spitLine.css('margin', '8px');
    $('body').append(messageDiv, spitLine);
  });
}


function addHeader() {
  inboxLink = $('<a></a>').text('点此访问98收件箱');
  inboxLink.addClass('inboxLink');
  inboxLink.attr('href', 'http://www.cc98.org/usersms.asp?action=inbox');
  inboxLink.attr('target', '_blank');

  $('body').append(inboxLink);
}

$(document).ready(function (){
  console.log("Dom loaded.");
  addHeader();
  putMessages();

/*  table_new = initTable();
  messages_all = getAllUnreed();
  table_new = putMessagesToTable (messages_all ,table_new);
  appendToBody(table_new);
  setStyle(titleMax * 4 + 120);*/
});