var cookieCache = {

  cookieStore: {},

  reset: function() {
    cookieStore = {};
  },

  add: function (cookies) {
    for (var i in cookies){
      if (cookies[i].name == 'aspsky'){
        console.log (cookies[i]);
        var username = cookies[i].value.match(/(username=)\w+(?=&usercookie)/g);        
        var usernamestr = username [0];
        usernamestr = usernamestr.substr(9);
        console.log (usernamestr);
        this.cookieStore[usernamestr] = cookies;
        console.log (this.cookieStore);
      }
    }
  }
}

var cookieProcess = {



  getCookie: function(){
    console.log("getCookie started");
    chrome.cookies.getAll({},function(cookies){
      console.log("getCookie successfully.");
      cookieCache.add(cookies);
    });
  }


}



// Run our script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
  console.log("loaded");
  cookieProcess.getCookie();
});
