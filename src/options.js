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
      // game
      if (localStorage.getItem('game') === null) {
        inputGame.value = 'bf4';
      } else {
        inputGame.value = localStorage.getItem('game');
      }
      // bgPermission
      if (localStorage.getItem('bgPermission') === null) {
        inputBgPermission.checked = false;
      } else {
        inputBgPermission.checked = (localStorage.getItem('bgPermission') === 'true');
      }
      // iconShowOffline
      if (localStorage.getItem('iconShowOffline') === null) {
        inputIconShowOffline.checked = false;
      } else {
        inputIconShowOffline.checked = (localStorage.getItem('iconShowOffline') === 'true');
      }
      // iconShowOnline
      if (localStorage.getItem('iconShowOnline') === null) {
        inputIconShowOnline.checked = true;
      } else {
        inputIconShowOnline.checked = (localStorage.getItem('iconShowOnline') === 'true');
      }
      // iconShowIngame
      if (localStorage.getItem('iconShowIngame') === null) {
        inputIconShowIngame.checked = true;
      } else {
        inputIconShowIngame.checked = (localStorage.getItem('iconShowIngame') === 'true');
      }
      // notifUpdatesIsActivated
      if (localStorage.getItem('notifUpdatesIsActivated') === null) {
        inputNotifUpdatesIsActivated.checked = false;
      } else {
        inputNotifUpdatesIsActivated.checked = (localStorage.getItem('notifUpdatesIsActivated') === 'true');
      }
      // notifUpdatesFrequency
      if (localStorage.getItem('notifUpdatesFrequency') === null) {
        inputNotifUpdatesFrequency.value = '1';
      } else {
        inputNotifUpdatesFrequency.value = localStorage.getItem('notifUpdatesFrequency');
      }
      // notifUpdatesIsSound
      if (localStorage.getItem('notifUpdatesIsSound') === null) {
        inputNotifUpdatesIsSound.checked = true;
      } else {
        inputNotifUpdatesIsSound.checked = (localStorage.getItem('notifUpdatesIsSound') === 'true');
      }
      // notifFriendsIsActivated
      if (localStorage.getItem('notifFriendsIsActivated') === null) {
        inputNotifFriendsIsActivated.checked = false;
      } else {
        inputNotifFriendsIsActivated.checked = (localStorage.getItem('notifFriendsIsActivated') === 'true');
      }
    }
    loadOptions();

    // Save options
    function saveOptions() {
      localStorage.setItem('game', inputGame.value);
      localStorage.setItem('bgPermission', inputBgPermission.checked);
      localStorage.setItem('iconShowOffline', inputIconShowOffline.checked);
      localStorage.setItem('iconShowOnline', inputIconShowOnline.checked);
      localStorage.setItem('iconShowIngame', inputIconShowIngame.checked);
      localStorage.setItem('notifUpdatesIsActivated', inputNotifUpdatesIsActivated.checked);
      localStorage.setItem('notifUpdatesFrequency', inputNotifUpdatesFrequency.value);
      localStorage.setItem('notifUpdatesIsSound', inputNotifUpdatesIsSound.checked);
      localStorage.setItem('notifFriendsIsActivated', inputNotifFriendsIsActivated.checked);
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