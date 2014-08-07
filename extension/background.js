(function () {
  'use strict';

  // Conditionally initialize the options.
  if (!localStorage.isInitialized) {
    localStorage.game = 'bf4';
    localStorage.isActivated = true;
    localStorage.frequency = 1;
    localStorage.isInitialized = true;
  }

  var HOME_URL = 'http://battlelog.battlefield.com/' + localStorage.game + '/';
  var JSON_URL  = 'http://battlelog.battlefield.com/' + localStorage.game + '/comcenter/sync/';
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
  function updateBadge() {
    var color;
    NotificationsCount(function (count, status) {
      if (count !== false) {
        color = colorOffline;
        if (status == 'playing') {
          color = colorPlaying;
        }
        if (status == 'online') {
          color = colorOnline;
        }
        render((count !== '0' ? count : ''), color, chrome.i18n.getMessage('browserActionDefaultTitle', [count, status]));
      } else {
        render('?', [190, 190, 190, 230], chrome.i18n.getMessage('browserActionErrorTitle'));
      }
    });
  }

  function showNotification() {
    NotificationsCount(function (count, status) {
      var opt = {
        type: "basic",
        title: "Battlelog friends",
        message: chrome.i18n.getMessage('browserActionDefaultTitle', [count, status]),
        iconUrl: "icon-48.png",
        buttons: [
          { title: "Open Battlelog", iconUrl: "home-27.png" }, // http://glyphicons.com
        ]
      };
      var notification = chrome.notifications.create('showFriends', opt, function() {
        // auto clear after 5s
        setTimeout(function() {
          chrome.notifications.clear('showFriends', function(){});
        }, 5000);
      });
    });
  }
  
  function isBattlelogUrl(url) {
    return url.indexOf(HOME_URL) == 0;
  }

  function openBattlelogInTab() {
    // check if Battle is already open
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
      for (var i = 0, tab; tab = tabs[i]; i++) {
        if (tab.url && isBattlelogUrl(tab.url)) {
          chrome.tabs.update(tab.id, {selected: true});
          return;
        }
      }
      chrome.tabs.create({url: HOME_URL});
    });
  }

  // Chrome alarm
  chrome.alarms.create('badge', {periodInMinutes: 1});
  /*
  if (JSON.parse(localStorage.isActivated) && localStorage.frequency) {
    chrome.alarms.create('notification', {periodInMinutes: parseInt(localStorage.frequency)});
  }
  */
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'badge') {
      updateBadge();
    }
    /*
    if (alarm.name == 'notification') {
      showNotification();
    }
    */
  });

  // browser action
  chrome.browserAction.onClicked.addListener(function () {
    openBattlelogInTab();
    // force update on click
    updateBadge();
    //showNotification();
  });

  
  // notification action
  chrome.notifications.onClicked.addListener(function () {
    //console.log("The notification was clicked");
    openBattlelogInTab();
  });

  // notification button action
  chrome.notifications.onButtonClicked.addListener(function () {
    //console.log("The notification button was clicked");
    openBattlelogInTab();
  });

  chrome.runtime.onMessage.addListener(function () {
    updateBadge();
  });

  updateBadge();
})();