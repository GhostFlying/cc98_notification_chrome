function getUserNow(){
  console.log("getUserNow");
  chrome.cookies.get({url:"http://www.cc98.org", name:"aspsky"}, function (cookie){
    console.log(cookie);
    if (cookie == null){

    }
    else {
      
    }
  });
}

getUserNow();