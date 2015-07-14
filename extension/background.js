(function () {
  'use strict';

  /**
   * Config
   */

  var BASE_URL = 'http://battlelog.battlefield.com/';
  var UPDATES_PATH = 'updates/';
  var COMCENTER_PATH = 'comcenter/sync/';
  var NOTIFICATIONS_PATH = 'updates/loadNotifications/';

  var colorOffline = [63, 59, 61, 255];
  var colorOnline  = [120, 199, 83, 255];
  var colorIngame  = [96, 192, 246, 255];

  /**
   * Main functions
   */

  // Friends count function
  window.FriendsCount = function (callback) {
    xhr('GET', getFriendsUrlJson(localStorage.game), function (data) {
      var key;
      var friendsCount = 0;
      var friendsOnlineCount = 0;
      var friendsIngameCount = 0;
      var count = '0';
      var status;
      var statusLabel;

      if (data === false) {
        callback(false);
      }

      try {
        var json = JSON.parse(data);
      } catch (e) {
        console.error("Parsing error:", e);
        callback(false);
        return;
      }

      if (json.type == 'success') {
        if (json.data.originavailable) {
          for(key in json.data.friendscomcenter) {
            if(json.data.friendscomcenter.hasOwnProperty(key)) {
              friendsCount++;
              if (json.data.friendscomcenter[key].presence.isOnline) {
                friendsOnlineCount++;
              }
              if (json.data.friendscomcenter[key].presence.isPlaying) {
                friendsIngameCount++;
              }
            }
          }
          if (friendsIngameCount > 0) {
            count = friendsIngameCount.toString();
            status = 'ingame';
            statusLabel = chrome.i18n.getMessage('statusIngame');
          }
          else {
            if (friendsOnlineCount > 0) {
              count = friendsOnlineCount.toString();
              status = 'online';
              statusLabel = chrome.i18n.getMessage('statusOnline');
            }
            else {
              count = friendsCount.toString();
              status = 'offline';
              statusLabel = chrome.i18n.getMessage('statusOffline');
            }
          }
        }
        // origin not available
        else {
          count = '0';
          status = 'offline';
          statusLabel = chrome.i18n.getMessage('statusOffline');
        }
        callback(count, status, statusLabel);
      }
      else {
        callback(false);
      }
    });
  };

  // Notifications count function
  window.NotificationsCount = function (callback) {
    xhr('GET', getNotificationsUrlJson(localStorage.game), function (data) {
      var count = '0';

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

  // update badge
  function updateBadge() {
    //console.log('updateBadge()'); // debug
    var color;
    FriendsCount(function (count, status, statusLabel) {
      //console.log('friends count: ' + count); // debug
      if (count !== false) {
        color = colorOffline;
        if (status == 'ingame') {
          color = colorIngame;
        }
        if (status == 'online') {
          color = colorOnline;
        }
        renderBadge((count !== '0' ? count : ''), color, chrome.i18n.getMessage('browserActionDefaultTitle', [count, statusLabel]));
      } else {
        renderBadge('?', [190, 190, 190, 230], chrome.i18n.getMessage('browserActionErrorTitle'));
      }
    });
  }

  function showNotification() {
    if (!chrome.notifications
      || localStorage.notifIsActivated != 'true')
    {
      return;
    }
    NotificationsCount(function (count) {
      //console.log('notifications count: ' + count); // debug
      if (count !== false && count > 0) {
        renderNotification(count);
      }
    });
  }

  /**
   * Helpers
   */

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

  function getHomeUrl(game) {
    return BASE_URL + game + '/';
  }
  function getUpdateUrl(game) {
    return BASE_URL + game + '/' + UPDATES_PATH;
  }
  function getFriendsUrlJson(game) {
    return BASE_URL + game + '/' + COMCENTER_PATH;
  }
  function getNotificationsUrlJson(game) {
    return BASE_URL + game + '/' + NOTIFICATIONS_PATH;
  }

  // badge renderer
  function renderBadge(badge, color, title) {
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

  // notitifcation renderer
  function renderNotification(count) {
    //console.log('renderNotification(' + count + ')'); // debug
    var opt = {
      type: "basic",
      title: chrome.i18n.getMessage('notificationTitle'),
      message: chrome.i18n.getMessage('notificationMessage', [count]),
      iconUrl: "icon-48.png",
      buttons: [
        { title: chrome.i18n.getMessage('notificationButton2Title') },
      ]
    };
    var optOpera = {
      type: "basic",
      title: chrome.i18n.getMessage('notificationTitle'),
      message: chrome.i18n.getMessage('notificationMessage', [count]),
      iconUrl: "icon-48.png"
    };
    var notification = chrome.notifications.create('showNotification', opt, function() {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        if (chrome.runtime.lastError.message == "Adding buttons to notifications is not supported.") {
          var notification = chrome.notifications.create('showNotification', optOpera, function() {});
        }
        return;
      }
    });
  }

  function isBattlelogUrl(url) {
    return url.indexOf(getHomeUrl(localStorage.game)) == 0;
  }

  function isBattlelogUpdatesUrl(url) {
    return url.indexOf(getUpdateUrl(localStorage.game)) == 0;
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
      chrome.tabs.create({url: getHomeUrl(localStorage.game)});
    });
  }

  function openBattlelogUpdatesInTab() {
    // check if Battlelog is already open
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
      for (var i = 0, tab; tab = tabs[i]; i++) {
        if (tab.url && isBattlelogUpdatesUrl(tab.url)) {
          chrome.tabs.update(tab.id, {selected: true});
          return;
        }
      }
      chrome.tabs.create({url: getUpdateUrl(localStorage.game)});
    });
  }
  function isBattlelogUrl(url) {
    return url.indexOf(getHomeUrl(localStorage.game)) == 0;
  }

  function isBattlelogUpdatesUrl(url) {
    return url.indexOf(getUpdateUrl(localStorage.game)) == 0;
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
      chrome.tabs.create({url: getHomeUrl(localStorage.game)});
    });
  }

  function openBattlelogUpdatesInTab() {
    // check if Battlelog is already open
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
      for (var i = 0, tab; tab = tabs[i]; i++) {
        if (tab.url && isBattlelogUpdatesUrl(tab.url)) {
          chrome.tabs.update(tab.id, {selected: true});
          return;
        }
      }
      chrome.tabs.create({url: getUpdateUrl(localStorage.game)});
    });
  }

  /**
   * Events
   */

  // alarms
  chrome.alarms.create('badge', {periodInMinutes: 1});
  if (localStorage.notifIsActivated == 'true'
    && localStorage.notifFrequency)
  {
    chrome.alarms.create('notification', {periodInMinutes: parseInt(localStorage.notifFrequency)});
  }
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'badge') {
      chrome.runtime.sendMessage({do: 'updatebadge'});
    }
    if (alarm.name == 'notification') {
      showNotification();
    }
  });

  // browser action
  chrome.browserAction.onClicked.addListener(function () {
    chrome.runtime.sendMessage({do: 'updatebadge'});
    chrome.runtime.sendMessage({do: 'shownotification'});
    openBattlelogHomeInTab();
  });

  if (chrome.notifications) { // Opera
    // notification action
    chrome.notifications.onClicked.addListener(function () {
      openBattlelogHomeInTab();
      chrome.notifications.clear('showNotification', function(){});
    });
    // notification button(s) action
    chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
      //console.log('button index: ' + buttonIndex); // debug
      switch (buttonIndex) {
        case 0:
          openBattlelogUpdatesInTab();
          break;
        default:
          chrome.notifications.clear('showNotification', function(){});
      }
    });
  }

  // check if new version is available
  chrome.runtime.onUpdateAvailable.addListener(function (details) {    
    console.log("updating to version " + details.version);
    chrome.runtime.reload();
  });
  // check whether new version is installed
  chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'install') {
      console.log("first install");
      // Initialize options
      localStorage.game = 'bf4';
      localStorage.notifIsActivated = false;
      localStorage.notifFrequency = 1;
    }
    else if (details.reason == 'update') {
      var version = chrome.runtime.getManifest().version;
      console.log("updated from " + details.previousVersion + " to " + version);
    }
    chrome.runtime.sendMessage({do: 'updatebadge'});
  });

  // on message update badge
  chrome.runtime.onMessage.addListener(function (message, sender, response) {
    //console.log('message: ' + '"' + message.do + '"'); // debug
    switch (message.do) {
      case 'updatebadge':
        updateBadge();
        break;
      case 'shownotification':
        showNotification();
        break;
      case 'shownotification_test':
        renderNotification(Math.floor((Math.random()*10)+1));
        break;
    }
  });
})();