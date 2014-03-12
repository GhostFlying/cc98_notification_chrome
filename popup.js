function appendToBody (table) {
  $("body").append(table);
}

function getAllUnreed () {
  message1 = {
    sender:"debug sender 1",
    title:"debug title 1"
  }
  message2 = {
    sender:"debug sender 2",
    title:"debug title 2"
  }

  message3 = {
    sender:"debug sender 3",
    title:"debug title3 debug title3 debug title3 debug title3 debug title3 debug title3 debug title3"
  }

  messages = [message1,message2,message3];

  return messages;
}

function initTable() {
  table = $("<table></table>");
  tableTitle = $("<tr></tr>").append($("<th></th>").text("Sender"), $("<th></th>").text("Titles"));
  table.append(tableTitle);
  return table;
}

function putMessagesToTable(messages, table) {
  $.each(messages, function(key,message){
    tileCol = $("<th></th>").text(message.title);
    senderCol = $("<th></th>").text(message.sender);
    messageRow = $("<tr></tr>").append(senderCol, tileCol);
    table.append(messageRow);
  });

  return table;
}

$(document).ready(function (){
  console.log("Dom loaded.");
  table_new = initTable();
  messages_all = getAllUnreed();
  table_new = putMessagesToTable (messages_all ,table_new);
  appendToBody(table_new);
});