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
  $('#loginNow').text(username);
}

function addToCheckerList(){
  console.log ('addToCheckerList');
  var checkerList;
  if (cookieNow != null) {
    chrome.storage.sync.get("checkerList",function (item){
      console.log (item);
      checkerList = item;
    });

    
  }

}

getUserNow();
$('#add').click(function(){
  addToCheckerList();
});