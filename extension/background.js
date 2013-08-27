(function () {
  var JSON_URL = 'http://battlelog.battlefield.com/bf3/fr/comcenter/sync/';
  var HOME_URL = 'http://battlelog.battlefield.com/bf3/';
  var colorOffline = [63, 59, 61, 255];
  var colorOnline  = [120, 199, 83, 255];
  var colorPlaying = [96, 192, 246, 255];
  
  
  // XHR helper function
  var xhr = function () {
    var xhr = new XMLHttpRequest();
    return function(method, url, callback) {
      xhr.onreadystatechange = function () {
        // request finished and response is ready
        if (xhr.readyState === 4) {
          if (xhr.status !== 200) {
            callback(false);
          }
          callback(xhr.responseText);
        }
      };
      xhr.open(method, url);
      xhr.send();
    };
  }();

  // main function
  window.NotificationsCount = function (callback) {

    xhr('GET', JSON_URL, function (data) {
      var key;
      var friendsCount = 0;
      var friendsOnlineCount = 0;
      var friendsPlayingCount = 0;
      var count = '0';
      var status;

      // no data
      if (data === false) {
        callback(false);
      }
      
      var json = JSON.parse(data);
      
      if (json.type == 'success') {
        if (json.data.originavailable) {
          for(key in json.data.friendscomcenter) {
            if(json.data.friendscomcenter.hasOwnProperty(key)) {
              friendsCount++;
              if (json.data.friendscomcenter[key].presence.isOnline) {
                friendsOnlineCount++;
              }
              if (json.data.friendscomcenter[key].presence.isPlaying) {
                friendsPlayingCount++;
              }
            }
          }
          if (friendsPlayingCount > 0) {
            count = friendsPlayingCount.toString();
            status = 'playing';
          }
          else {
            if (friendsOnlineCount > 0) {
              count = friendsOnlineCount.toString();
              status = 'online';
            }
            else {
              count = friendsCount.toString();
              status = 'offline';
            }
          }
        }
        // origin not available
        else {
          count = '0';
          status = 'offline';
        }
        callback(count, status);
      }
      else {
        callback(false);
      }
    });
  };

  // badge renderer
  function render(badge, color, title) {
    chrome.browserAction.setBadgeText({
      text: badge
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: color
    });
    chrome.browserAction.setTitle({
      title: title
    });
  }

  // update badge
  function update() {
    var color;
    NotificationsCount(function (count, status) {
      if (count !== false) {
        console.log(status);
        color = colorOffline;
        if (status == 'playing') {
          color = colorPlaying;
        }
        if (status == 'online') {
          color = colorOnline;
        }
        render((count !== '0' ? count : ''), color, chrome.i18n.getMessage('browserActionDefaultTitle', count));
      } else {
        render('?', [190, 190, 190, 230], chrome.i18n.getMessage('browserActionErrorTitle'));
      }
    });
  }

  // Chrome alarm
  chrome.alarms.create({periodInMinutes: 1});
  chrome.alarms.onAlarm.addListener(update);

  // browser action
  chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.create({
      url: HOME_URL
    });
    update();
  });

  update();
})();