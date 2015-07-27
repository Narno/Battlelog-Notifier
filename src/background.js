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

  var soundBleep = 'UI_Bleep_Notification.ogg';

  var BASE_URL_TEST = 'https://raw.githubusercontent.com/Narno/Battlelog-Notifier/master/test/fixtures/';
  var COMCENTER_PATH_TEST_ONLINE = 'comcenter/sync/online.json';
  var COMCENTER_PATH_TEST_INGAME = 'comcenter/sync/ingame.json';
  var NOTIFICATIONS_PATH_TEST_3 = 'updates/loadNotifications/3.json';

  // Test
  //var BASE_URL = BASE_URL_TEST;
  //var COMCENTER_PATH = COMCENTER_PATH_TEST_INGAME;
  //var NOTIFICATIONS_PATH = NOTIFICATIONS_PATH_TEST_3;

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
        if (json.type == 'success') {
          if (json.data.originavailable) {
            // count friends
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
            } else {
              if (friendsOnlineCount > 0) {
                count = friendsOnlineCount.toString();
                status = 'online';
                statusLabel = chrome.i18n.getMessage('statusOnline');
              } else {
                count = friendsCount.toString();
                status = 'offline';
                statusLabel = chrome.i18n.getMessage('statusOffline');
              }
            }
            // desktop notification
            // @todo move code
            if (localStorage.notifFriendsIsActivated) {
              if (localStorage.getItem('countIngame') !== null) {
                var friendsIngameCountPrev = localStorage.getItem('countIngame');
                if (friendsIngameCount > friendsIngameCountPrev) {
                  renderFriendsNotification(friendsIngameCount.toString(), chrome.i18n.getMessage('statusIngame'));
                }
              }
              if (friendsIngameCount > 0) {
                localStorage.setItem('countIngame', friendsIngameCount);
              }
              if (localStorage.getItem('countOnline') !== null) {
                var friendsOnlineCountPrev = localStorage.getItem('countOnline');
                if (friendsOnlineCount > friendsOnlineCountPrev) {
                  renderFriendsNotification(friendsOnlineCount.toString(), chrome.i18n.getMessage('statusOnline'));
                }
              }
              if (friendsOnlineCount > 0) {
                localStorage.setItem('countOnline', friendsOnlineCount);
              }
            }
            //
          // EA Origin not available
          } else {
            count = '0';
            status = 'offline';
            statusLabel = chrome.i18n.getMessage('statusOffline');
          }
          callback(count, status, statusLabel);
        } else {
          callback(false);
        }
      } catch (e) {
        console.error("Parsing error:", e);
        callback(false);
        return;
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
      } else {
        callback(false);
      }
    });
  };

  // update badge
  function updateBadge() {
    var color, badgeText = true;
    new FriendsCount(function (count, status, statusLabel) {
      if (count !== false) {
        switch(status) {
          case 'ingame':
            color = colorIngame;
            if (localStorage.iconShowIngame == 'false') {
              count = '0';
              badgeText = false;
            }
            break;
          case 'online':
            color = colorOnline;
            if (localStorage.iconShowOnline == 'false') {
              count = '0';
              badgeText = false;
            }
            break;
          case 'offline':
            color = colorOffline;
            if (localStorage.iconShowOffline == 'false') {
              count = '0';
              badgeText = false;
            }
            break;
        }
        if (badgeText) {
          renderBadge((count !== '0' ? count : ''), color, chrome.i18n.getMessage('browserActionDefaultTitle', [count, statusLabel]));
        } else {
          renderBadge('', color, '');
        }
      } else {
        renderBadge('?', [190, 190, 190, 230], chrome.i18n.getMessage('browserActionErrorTitle'));
      }
    });
  }

  function showNotificationUpdates() {
    var sound = false;
    if (!chrome.notifications || localStorage.notifUpdatesIsActivated != 'true') {
      return;
    }
    if (localStorage.notifUpdatesIsSound == 'true') {
      sound = true;
    }
    new NotificationsCount(function (count) {
      if (count !== false && count > 0) {
        renderUpdatesNotification(count, sound);
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

  // updates notitifcation renderer
  function renderUpdatesNotification(count, sound) {
    var opt = {
      type: "basic",
      title: chrome.i18n.getMessage('notificationUpdatesTitle'),
      message: chrome.i18n.getMessage('notificationUpdatesMessage', [count]),
      iconUrl: "icon-48.png",
      buttons: [
        { title: chrome.i18n.getMessage('notificationButton2Title') },
      ]
    };
    var optOpera = {
      type: "basic",
      title: chrome.i18n.getMessage('notificationUpdatesTitle'),
      message: chrome.i18n.getMessage('notificationUpdatesMessage', [count]),
      iconUrl: "icon-48.png"
    };
    var notification = chrome.notifications.create('showNotificationUpdates', opt, function() {
      if (sound) {
        playSound();
      }
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
        if (chrome.runtime.lastError.message == "Adding buttons to notifications is not supported.") {
          var notification = chrome.notifications.create('showNotificationUpdates', optOpera, function() {});
        }
        return;
      }
    });
  }

  // friends notitifcation renderer
  function renderFriendsNotification(count, status) {
    var opt = {
      type: "basic",
      title: chrome.i18n.getMessage('notificationFriendsTitle'),
      message: chrome.i18n.getMessage('notificationFriendsMessage', [count, status]),
      iconUrl: "icon-48.png"
    };
    var notification = chrome.notifications.create('friendsNotification' + status, opt, function(id) {
      setTimeout(function() {
        chrome.notifications.clear(id);
      }, 4000);
    });
  }

  function playSound() {
    var notifAudio = new Audio();
    notifAudio.src = soundBleep;
    notifAudio.play();
  }

  function isBattlelogUrl(url) {
    return url.indexOf(getHomeUrl(localStorage.game)) === 0;
  }

  function isBattlelogUpdatesUrl(url) {
    return url.indexOf(getUpdateUrl(localStorage.game)) === 0;
  }

  function openBattlelogHomeInTab(flag) {
    // check if Battle is already open
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
      for (var i = 0, tab; tab = tabs[i]; i++) {
        if (tab.url && isBattlelogUrl(tab.url)) {
          chrome.tabs.update(tab.id, {selected: true}, function(tab) {
            if (flag) {
              clickOnFlag();
            }
          });
          return;
        }
      }
      chrome.tabs.create({url: getHomeUrl(localStorage.game)}, function(tab) {
        if (flag) {
          clickOnFlag();
        }
      });
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

  function clickOnFlag() {
    chrome.tabs.executeScript({
      file: 'vendor/zepto.min.js',
      runAt: 'document_end'
    }, function() {
      chrome.tabs.executeScript({
        code: "$('#updates-icon').click();",
        runAt: 'document_end'
      }); 
    });
  }

  /**
   * Events
   */

  // alarms
  chrome.alarms.create('badge', {periodInMinutes: 1});
  if (localStorage.notifUpdatesIsActivated == 'true' && localStorage.notifUpdatesFrequency) {
    chrome.alarms.create('notification', {periodInMinutes: parseInt(localStorage.notifUpdatesFrequency)});
  }
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'badge') {
      chrome.runtime.sendMessage({do: 'update_badge'});
    }
    if (alarm.name == 'notification') {
      showNotificationUpdates();
    }
  });

  // browser action
  chrome.browserAction.onClicked.addListener(function () {
    chrome.runtime.sendMessage({do: 'update_badge'});
    chrome.runtime.sendMessage({do: 'show_updates_notification'});
    openBattlelogHomeInTab();
  });

  if (chrome.notifications) {
    // notification action
    chrome.notifications.onClicked.addListener(function () {
      chrome.notifications.clear('showNotificationUpdates');
      openBattlelogHomeInTab(true);
    });
    // notification button(s) action
    chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
      switch (buttonIndex) {
        case 0:
          chrome.notifications.clear('showNotificationUpdates');
          openBattlelogUpdatesInTab();
          break;
      }
    });
  }

  // check if new version is available
  chrome.runtime.onUpdateAvailable.addListener(function (details) {
    var manifest = chrome.runtime.getManifest();
    console.log(manifest.name + " updating to v" + details.version);
    chrome.runtime.reload();
  });
  // check whether new version is installed
  chrome.runtime.onInstalled.addListener(function (details) {
    var manifest = chrome.runtime.getManifest();
    if (details.reason == 'install') {
      console.log(manifest.name + " first install (v" + manifest.version + ")");
      // Initialize options
      localStorage.game = 'bf4';
      localStorage.iconShowOffline = false;
      localStorage.iconShowOnline = true;
      localStorage.iconShowIngame = true;
      localStorage.notifUpdatesIsActivated = false;
      localStorage.notifUpdatesFrequency = 5;
      localStorage.notifUpdatesIsSound = true;
      localStorage.notifFriendsIsActivated = false;
    } else if (details.reason == 'update') {
      console.log(manifest.name + " updated from v" + details.previousVersion + " to v" + manifest.version);
    }
    chrome.runtime.sendMessage({do: 'update_badge'});
  });

  // on message update badge
  chrome.runtime.onMessage.addListener(function (message, sender, response) {
    switch (message.do) {
      case 'update_badge':
        updateBadge();
        break;
      case 'show_updates_notification':
        showNotificationUpdates();
        break;
      case 'show_updates_notification_test':
        var sound = false;
        if (!chrome.notifications) {
          return;
        }
        if (localStorage.notifUpdatesIsSound == 'true') {
          sound = true;
        }
        renderUpdatesNotification(Math.floor((Math.random()*10)+1), sound);
        break;
      case 'show_friends_notification_test':
        if (!chrome.notifications) {
          return;
        }
        var statusArray = [
          chrome.i18n.getMessage('statusIngame'),
          chrome.i18n.getMessage('statusOnline')
        ];
        renderFriendsNotification(Math.floor((Math.random()*10)+1), statusArray[Math.floor(Math.random()*statusArray.length)]);
        break;
    }
  });
})();