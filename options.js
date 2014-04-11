var cookieNow;

function getUserNow() {
    console.log("getUserNow");
    chrome.cookies.get({
        url: "http://www.cc98.org",
        name: "aspsky"
    }, function(cookie) {
        if (cookie == null) {
            cookieNow = null;
            console.log('Not log in.');
        } else {
            console.log(cookie);
            cookieNow = cookie;
            setUserNow(cookie);
        }
    });
}

function setUserNow(cookie) {
    username = cookie.value.match(/username=.+(?=&usercookies)/g)[0].substr(9);
    $('#loginNow').text(decodeURIComponent(username));
    chrome.storage.sync.get("checkerList", function(item) {
        $.each(item.checkerList, function(index, value) {
            username = value.match(/username=.+(?=&usercookies)/g)[0].substr(9);
            settedUserDiv = $('<div></div>').text(decodeURIComponent(username));
            removeButton = $('<button></button>').text('Remove');
            settedUserDiv.addClass('content');
            removeButton.addClass('content');
            removeButton.click(function(){
                removeFromCheckerList(username);
            });
            settedUserArray = $('<div></div>');
            settedUserArray.append(settedUserDiv, removeButton);
            $('#settedUser').append(settedUserArray);
        });
    });
}

function addToCheckerList() {
    var ACTION_NONE = 0;
    var ACTION_ADD = 1;
    var ACTION_UODATE = 2;

    console.log('addToCheckerList');
    var checkerList;
    needAddFlag = ACTION_ADD;
    if (cookieNow != null) {
        chrome.storage.sync.get("checkerList", function(item) {
            if (isEmptyObject(item)) {
                console.log('empty.');
                checkerList = new Array();
            } else {
                console.log('not empty');
                checkerList = item.checkerList;
                username = cookieNow.value.match(/username=.+(?=&usercookies)/g)[0].substr(9);
                $.each(checkerList, function(index, cookieStr) {
                    if (cookieStr == cookieNow.value) {
                        console.log('cookie duplicated.');
                        needAddFlag = ACTION_NONE;
                        return;
                    } else if (cookieStr.indexOf('username=' + username + '&usercookies') > -1) {
                        checkerList[index] = cookieNow.value;
                        console.log('update cookie.');
                        needAddFlag = ACTION_UODATE;
                        return;
                    }
                });
            }

            switch (needAddFlag) {
                case ACTION_ADD:
                    checkerList.push(cookieNow.value);
                case ACTION_UODATE:
                    chrome.storage.sync.set({
                        'checkerList': checkerList
                    }, function() {
                        console.log(checkerList);
                    });
                    break;
                case ACTION_NONE:
            }
        });
    }
}

function removeFromCheckerList(username){
    console.log ('removeFromCheckerList');

    chrome.storage.sync.get("checkerList", function(item) {
        checkerList = item.checkerList;

        $.each (checkerList, function(index, value){
            if (value.indexOf(username) > -1) {
                checkerList.splice(index,1);
                return;
            }
        });
        chrome.storage.sync.set({
                        'checkerList': checkerList
                    }, function() {
                        console.log(checkerList);
        });
    });
    $('#settedUser').text('');
    getUserNow();

}


function isEmptyObject(obj) {
    for (var name in obj) {
        return false;
    }
    return true;
}

getUserNow();
$('#add').click(function() {
    addToCheckerList();
    $('#settedUser').text('');
    getUserNow();
});

//chrome.storage.sync.clear(function(){});