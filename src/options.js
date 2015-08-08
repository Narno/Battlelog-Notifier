(function () {
  'use strict';

  // DOM / CSS handling with zeptojs
  $(function() {
    $('.menu a').click(function(ev) {
      ev.preventDefault();
      var selected = 'selected';
      $('.mainview > *').removeClass(selected);
      $('.menu li').removeClass(selected);
      setTimeout(function() {
        $('.mainview > *:not(.selected)').css('display', 'none');
      }, 100);
      $(ev.currentTarget).parent().addClass(selected);
      var currentView = $($(ev.currentTarget).attr('href'));
      currentView.css('display', 'block');
      setTimeout(function() {
        currentView.addClass(selected);
      }, 0);
      setTimeout(function() {
        $('body')[0].scrollTop = 0;
      }, 200);
    });
    $('.mainview > *:not(.selected)').css('display', 'none');
  });

  document.addEventListener('DOMContentLoaded', function () {
    var inputGame = document.getElementById('game');
    var inputBgPermission = document.getElementById('bgPermission');
    var inputIconShowOffline = document.getElementById('iconShowOffline');
    var inputIconShowOnline = document.getElementById('iconShowOnline');
    var inputIconShowIngame = document.getElementById('iconShowIngame');
    var inputNotifUpdatesIsActivated = document.getElementById('notifUpdatesIsActivated');
    var inputNotifUpdatesFrequency = document.getElementById('notifUpdatesFrequency');
    var inputNotifUpdatesIsSound = document.getElementById('notifUpdatesIsSound');
    var inputNotifFriendsIsActivated = document.getElementById('notifFriendsIsActivated');
    var successMessage = document.getElementById('success_message');
    var successTimeout = null;

    // Settings
    // @too should move
    var Settings = (function () {
      var defaults = {
        game: 'bf4',
        iconShowOffline: false,
        iconShowOnline: true,
        iconShowIngame: true,
        notifUpdatesIsActivated: false,
        notifUpdatesFrequency: 5,
        notifUpdatesIsSound: true,
        notifFriendsIsActivated: false,
      };

      var settings = {
        storage: {
          get: function (name) {
            var item = localStorage.getItem(name);
            if (item === null) {
              return ({}.hasOwnProperty.call(defaults, name) ? defaults[name] : void 0);
            } else if (item === 'true' || item === 'false') {
              return (item === 'true');
            }
            return item;
          },
          set: localStorage.setItem.bind(localStorage)
        }
      };

      return settings;
    })();

    // Apply translations
    function applyTranslations() {
      var objects = document.getElementsByTagName('*'), i;
      for (i = 0; i < objects.length; i++) {
        if (objects[i].dataset && objects[i].dataset.message) {
          objects[i].innerHTML = chrome.i18n.getMessage(objects[i].dataset.message);
        }
      }
    }
    applyTranslations();

    // Laod options
    function loadOptions() {
      inputGame.value = Settings.storage.get('game');
      inputBgPermission.checked = Settings.storage.get('bgPermission');
      inputIconShowOffline.checked = Settings.storage.get('iconShowOffline');
      inputIconShowOnline.checked = Settings.storage.get('iconShowOnline');
      inputIconShowIngame.checked = Settings.storage.get('iconShowIngame');
      inputNotifUpdatesIsActivated.checked = Settings.storage.get('notifUpdatesIsActivated');
      inputNotifUpdatesFrequency.value = Settings.storage.get('notifUpdatesFrequency');
      inputNotifUpdatesIsSound.checked = Settings.storage.get('notifUpdatesIsSound');
      inputNotifFriendsIsActivated.checked = Settings.storage.get('notifFriendsIsActivated');
    }
    loadOptions();

    // Save options
    function saveOptions() {
      Settings.storage.set('game', inputGame.value);
      Settings.storage.set('bgPermission', inputBgPermission.checked);
      Settings.storage.set('iconShowOffline', inputIconShowOffline.checked);
      Settings.storage.set('iconShowOnline', inputIconShowOnline.checked);
      Settings.storage.set('iconShowIngame', inputIconShowIngame.checked);
      Settings.storage.set('notifUpdatesIsActivated', inputNotifUpdatesIsActivated.checked);
      Settings.storage.set('notifUpdatesFrequency', inputNotifUpdatesFrequency.value);
      Settings.storage.set('notifUpdatesIsSound', inputNotifUpdatesIsSound.checked);
      Settings.storage.set('notifFriendsIsActivated', inputNotifFriendsIsActivated.checked);
      // success message
      clearTimeout(successTimeout);
      successMessage.classList.add('visible');
      successTimeout = setTimeout(function() {
        successMessage.classList.remove('visible');
      }, 2000);
    }
    document.getElementById('game').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });
    document.getElementById('bgPermission').addEventListener('change', function () {
      var permission = {'permissions': ['background']};
      /*
      chrome.permissions.contains(permission, function(result) {
        if (result) {
          alert('granted');
        } else {
          alert('not granted');
        }
      });
      */
      if (inputBgPermission.checked) {
        chrome.permissions.request(permission, function(granted) {
          /*
          if (granted) {
            alert('granted');
          } else {
            alert('not granted');
          }
          */
        });
      } else {
        chrome.permissions.remove(permission, function(removed) {
          /*
          if (removed) {
            alert('removed');
          } else {
            alert('not removed');
          }
          */
        });
      }
      saveOptions();
    });
    document.getElementById('iconShowOffline').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });
    document.getElementById('iconShowOnline').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });
    document.getElementById('iconShowIngame').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });
    document.getElementById('notifUpdatesIsActivated').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'show_updates_notification'});
    });
    document.getElementById('notifUpdatesFrequency').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'show_updates_notification'});
    });
    document.getElementById('notifUpdatesIsSound').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'show_updates_notification'});
    });
    document.getElementById('notifFriendsIsActivated').addEventListener('change', function () {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });

    // Updates notification test
    document.getElementById('notifUpdatesTest').addEventListener('click', function () {
      if (chrome.notifications) {
        chrome.runtime.sendMessage({do: 'show_updates_notification_test'});
        return;
      }
    });
    // Friends notification test
    document.getElementById('notifFriendsTest').addEventListener('click', function () {
      if (chrome.notifications) {
        chrome.runtime.sendMessage({do: 'show_friends_notification_test'});
        return;
      }
    });

    // Hide notifications options if not available
    if (!chrome.notifications) {
      $(function() {
        $('#li_notifications').css('display', 'none');
      });
    }

    // Extension version in about page
    var manifest = chrome.runtime.getManifest();
    $(function() {
      $('#version').html(manifest.version);
    });
  });
})();