(function () {
  'use strict';

  // DOM / CSS handling with zeptojs
  $(() => {
    $('.menu a').click(ev => {
      ev.preventDefault();
      const selected = 'selected';
      $('.mainview > *').removeClass(selected);
      $('.menu li').removeClass(selected);
      setTimeout(() => {
        $('.mainview > *:not(.selected)').css('display', 'none');
      }, 100);
      $(ev.currentTarget).parent().addClass(selected);
      const currentView = $($(ev.currentTarget).attr('href'));
      currentView.css('display', 'block');
      setTimeout(() => {
        currentView.addClass(selected);
      }, 0);
      setTimeout(() => {
        $('body')[0].scrollTop = 0;
      }, 200);
    });
    $('.mainview > *:not(.selected)').css('display', 'none');
  });

  document.addEventListener('DOMContentLoaded', () => {
    const inputGame = document.getElementById('game');
    const inputBgPermission = document.getElementById('bgPermission');
    const inputIconShowOffline = document.getElementById('iconShowOffline');
    const inputIconShowOnline = document.getElementById('iconShowOnline');
    const inputIconShowIngame = document.getElementById('iconShowIngame');
    const inputNotifUpdatesIsActivated = document.getElementById('notifUpdatesIsActivated');
    const inputNotifUpdatesFrequency = document.getElementById('notifUpdatesFrequency');
    const inputNotifUpdatesIsSound = document.getElementById('notifUpdatesIsSound');
    const inputNotifFriendsIsActivated = document.getElementById('notifFriendsIsActivated');
    const successMessage = document.getElementById('success_message');
    let successTimeout = null;

    // Settings
    // @todo should move
    const Settings = (() => {
      const defaults = {
        game: 'bf4',
        iconShowOffline: false,
        iconShowOnline: true,
        iconShowIngame: true,
        notifUpdatesIsActivated: false,
        notifUpdatesFrequency: 5,
        notifUpdatesIsSound: true,
        notifFriendsIsActivated: false
      };

      const settings = {
        storage: {
          get: name => {
            const item = localStorage.getItem(name);
            if (item === null) {
              return ({}.hasOwnProperty.call(defaults, name) ? defaults[name] : 0);
            }
            if (item === 'true' || item === 'false') {
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
      const objects = document.getElementsByTagName('*');
      let i;
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
      // Success message
      clearTimeout(successTimeout);
      successMessage.classList.add('visible');
      successTimeout = setTimeout(() => {
        successMessage.classList.remove('visible');
      }, 2000);
    }
    document.getElementById('game').addEventListener('change', () => {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });
    document.getElementById('iconShowOffline').addEventListener('change', () => {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });
    document.getElementById('iconShowOnline').addEventListener('change', () => {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });
    document.getElementById('iconShowIngame').addEventListener('change', () => {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });
    document.getElementById('notifUpdatesIsActivated').addEventListener('change', () => {
      saveOptions();
      chrome.runtime.sendMessage({do: 'show_updates_notification'});
    });
    document.getElementById('notifUpdatesFrequency').addEventListener('change', () => {
      saveOptions();
      chrome.runtime.sendMessage({do: 'show_updates_notification'});
    });
    document.getElementById('notifUpdatesIsSound').addEventListener('change', () => {
      saveOptions();
      chrome.runtime.sendMessage({do: 'show_updates_notification'});
    });
    document.getElementById('notifFriendsIsActivated').addEventListener('change', () => {
      saveOptions();
      chrome.runtime.sendMessage({do: 'update_badge'});
    });

    // Updates notification test
    document.getElementById('notifUpdatesTest').addEventListener('click', () => {
      if (chrome.notifications) {
        chrome.runtime.sendMessage({do: 'show_updates_notification_test'});
      }
    });
    // Friends notification test
    document.getElementById('notifFriendsTest').addEventListener('click', () => {
      if (chrome.notifications) {
        chrome.runtime.sendMessage({do: 'show_friends_notification_test'});
      }
    });

    // Hide notifications options if not available
    if (!chrome.notifications) {
      $(() => {
        $('#li_notifications').css('display', 'none');
      });
    }

    // Extension version in about page
    const manifest = chrome.runtime.getManifest();
    $(() => {
      $('#version').html(manifest.version);
    });
  });
})();
