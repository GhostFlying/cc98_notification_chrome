var cookieNow;

function getUserNow(){
  console.log("getUserNow");
  chrome.cookies.get({url:"http://www.cc98.org", name:"aspsky"}, function (cookie){    
    if (cookie == null){
      cookieNow = null;
      console.log('Not log in.');
    }
    else {
      console.log(cookie);
      cookieNow = cookie;
      setUserNow(cookie);
    }
  });
}

function setUserNow(cookie){
  username = cookie.value.match(/username=.+(?=&usercookies)/g)[0].substr(9);
  $('#loginNow').text(decodeURIComponent(username));
}

function addToCheckerList(){
  console.log ('addToCheckerList');
  var checkerList;
  if (cookieNow != null) {
    chrome.storage.sync.get("checkerList",function (item){      
      if (isEmptyObject(item)){
        console.log('empty.');
        checkerList = new Array();
      }
      else {
        console.log ('not empty');
        checkerList = item.checkerList;
      }
      checkerList.push(cookieNow.value);
      chrome.storage.sync.set({'checkerList':checkerList}, function(){
      console.log(checkerList);
    });
    });
   
  }

}


function isEmptyObject(obj) {
  for (var name in obj){
    return false;
  }
  return true;
}

getUserNow();
$('#add').click(function(){
  addToCheckerList();
});

chrome.storage.sync.clear(function(){});