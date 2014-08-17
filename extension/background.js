(function () {
  'use strict';

  // Initialize options
  chrome.runtime.onInstalled.addListener(function () {
    localStorage.game = 'bf4';
    localStorage.notifIsActivated = true;
    localStorage.notifFrequency = 1;
    localStorage.notifications = 0;
  });

  var HOME_URL = 'http://battlelog.battlefield.com/' + localStorage.game + '/';
  var UPDATES_URL = 'http://battlelog.battlefield.com/' + localStorage.game + '/updates/';
  var FRIENDS_URL_JSON  = 'http://battlelog.battlefield.com/' + localStorage.game + '/comcenter/sync/';
  var NOTIFICATIONS_URL_JSON  = 'http://battlelog.battlefield.com/' + localStorage.game + '/updates/loadNotifications/';
  //var NOTIFICATIONS_URL_JSON  = 'https://raw.githubusercontent.com/Narno/Battlelog-Notifier/prototype/data/notifications_unread_3.json';

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
  window.FriendsCount = function (callback) {
    xhr('GET', FRIENDS_URL_JSON, function (data) {
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

  window.NotificationsCount = function (callback) {
    xhr('GET', NOTIFICATIONS_URL_JSON, function (data) {
      var count = '0';

      // no data
      if (data === false) {
        callback(false);
      }

      var json = JSON.parse(data);
      if (json.type == 'success') {
        count = json.data.numUnread.toString();
        callback(count);
      }
      else {
        callback(false);
      }
    });
  }

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
    FriendsCount(function (count, status) {
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
    NotificationsCount(function (count) {
      //console.log(count); // debug
      if (count > localStorage.getItem('notifications')) {
        var opt = {
          type: "basic",
          title: "Battlelog updates",
          message: chrome.i18n.getMessage('notificationMessage', [count]),
          iconUrl: "icon-48.png",
          buttons: [
            { title: "View all updates", iconUrl: "glyphicons_266_flag.png" },
          ]
        };
        var notification = chrome.notifications.create('showNotification', opt, function() {
          // auto clear after 5s
          /*
          setTimeout(function() {
            chrome.notifications.clear('showNotification', function(){});
          }, 5000);
          */
        });
      }
      localStorage.setItem('notifications', count);
    });
  }
  
  function isBattlelogUrl(url) {
    return url.indexOf(HOME_URL) == 0;
  }

  function isBattlelogUpdatesUrl(url) {
    return url.indexOf(UPDATES_URL) == 0;
  }

  function openBattlelogHomeInTab() {
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

  function openBattlelogUpdatesInTab() {
    // check if Battle is already open
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
      for (var i = 0, tab; tab = tabs[i]; i++) {
        if (tab.url && isBattlelogUpdatesUrl(tab.url)) {
          chrome.tabs.update(tab.id, {selected: true});
          return;
        }
      }
      chrome.tabs.create({url: UPDATES_URL});
    });
  }

  // Alarms
  // badge
  chrome.alarms.create('badge', {periodInMinutes: 1});
  // notifications
  if (JSON.parse(localStorage.notifIsActivated) && localStorage.notifFrequency) {
    chrome.alarms.create('notification', {periodInMinutes: parseInt(localStorage.notifFrequency)});
  }
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'badge') {
      updateBadge();
    }
    if (alarm.name == 'notification') {
      showNotification();
    }
  });

  // browser action
  chrome.browserAction.onClicked.addListener(function () {
    // force badge update on click
    updateBadge();
    // force show notifications on click
    showNotification();
    // open Battlelog
    openBattlelogHomeInTab();
  });
  
  // notification action
  chrome.notifications.onClicked.addListener(function () {
    // open Battlelog
    //openBattlelogHomeInTab();
    // close notification
    chrome.notifications.clear('showNotification', function(){});
  });

  // notification button action
  chrome.notifications.onButtonClicked.addListener(function () {
    // open Battlelog updates
    openBattlelogUpdatesInTab();
  });

  // message
  chrome.runtime.onMessage.addListener(function () {
    updateBadge();
  });

  updateBadge();
})();