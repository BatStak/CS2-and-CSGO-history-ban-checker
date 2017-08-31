var banCheckerButton = document.createElement('a');
banCheckerButton.setAttribute('href', "//steamcommunity.com/my/friends/banchecker");
banCheckerButton.classList.add('sectionTab');
banCheckerButton.innerHTML = "<span>Ban Checker</span>";
document.querySelector('.responsive_tab_select').innerHTML += '<option value="//steamcommunity.com/my/friends/banchecker">Ban Checker</option>';

var gamesShowingCount = 0;
var loadMoreValue = 2;

if (window.location.pathname.split("/").pop() == 'banchecker'){
  document.querySelector('.sectionTabs a:first-child').classList.remove('active');
  banCheckerButton.classList.add('active');
  renderBanCheker();
}
document.querySelector('.sectionTabs').appendChild(banCheckerButton);

function createPlayerElement(player){
  var playerBody = document.createElement('div');
  playerBody.classList.add('friendBlock', 'persona');
  if (player.bannedAfterRecording) playerBody.classList.add('banned');
  playerBody.setAttribute('data-miniprofile', player.miniprofile);
  playerBody.setAttribute('href', "//steamcommunity.com/profiles/" + player.steamid);
  playerBody.innerHTML = '<a class="friendBlockLinkOverlay" href="//steamcommunity.com/profiles/' + player.steamid + '"></a>';
  var avatar = document.createElement('div');
  avatar.classList.add('playerAvatar');
  // We'll load avatars like this so we don't waste steam api calls
  fetch('http://steamcommunity.com/profiles/' + player.steamid + '?xml=1')
  .then(response => response.text())
  .then(function(xml){
    var regex = /http:\/\/(.+)_medium.jpg/;
    var avatarURLs = xml.match(regex);
    if (avatarURLs != null) {
      var avatarURL = avatarURLs[0];
      avatar.innerHTML = '<img src=' + avatarURL + '>';
    }
    //console.log(avatar);
    var thisPlayer = document.querySelectorAll('.friendBlock[data-miniprofile="' + player.miniprofile + '"]');
    thisPlayer.forEach(function(thisOne){
      if (thisOne.querySelector('.playerAvatar') == null) {
        thisOne.insertAdjacentElement('afterbegin', avatar);
      };
    });
    //console.log(player.miniprofile);
  });
  var name = document.createElement('div');
  name.innerHTML = player.name;
  playerBody.appendChild(name);
  if (player.bannedAfterRecording) {
    playerBody.style.backgroundColor = "rgba(230,0,0,0.3)";
  }
  return playerBody;
}

function createGameElement(game){
  var gameBody = document.createElement('div');
  gameBody.classList.add('coplayGroup');

  var gameInfo = document.createElement('div');
  gameInfo.classList.add('gameListRow');

  var gameImage = document.createElement('div');
  gameImage.classList.add('gameListRowLogo');
  gameImage.innerHTML = '<div class="gameLogoHolder_default"><div class="gameLogo"><a href="http://steamcommunity.com/app/' + game.appid +'"><img src="//cdn.akamai.steamstatic.com/steam/apps/' + game.appid + '/header.jpg"></a></div></div>';

  var gameAbout = document.createElement('div');
  gameAbout.classList.add('gameListRowItem');
  gameAbout.innerHTML = "<h4>AppID: " + game.appid + "</h4><br/>Played: " + new Date(game.time)
                     + "<br/>Last Time Scanned: " + ((game.lastScanTime == 0) ? 'Never' : new Date(game.lastScanTime));

  gameInfo.appendChild(gameImage);
  gameInfo.appendChild(gameAbout);
  gameBody.appendChild(gameInfo);

  playersBody = document.createElement('div');
  playersBody.classList.add('responsive_friendblocks');

  game.players.forEach(function(player){
    playersBody.appendChild(createPlayerElement(player));
  });

  gameBody.appendChild(playersBody);

  gameBody.innerHTML += '<div style="clear: left;"></div>';
  return gameBody;
}

function gamesRendering(div, appid, bannedOnly, tenPlayers, allPages){
  chrome.storage.local.get('games', function(data) {
    if (typeof data.games === 'undefined' || data.games.length === 0) {
      div.innerHTML = 'No recorded games yet.';
    } else {
      if (gamesShowingCount == data.games.length){
        var message = document.querySelector('#paginationNoMore');
        message.style.display = 'block';
        setTimeout(function(){
          message.style.display = 'none';
        }, 500);
        return;
      }
      div.classList.add('profile_friends');
      var lastGameToShowThisCycle;
      if (allPages) {
        lastGameToShowThisCycle = data.games.length;
      } else {
        lastGameToShowThisCycle = gamesShowingCount + loadMoreValue;
      }
      for (var i = gamesShowingCount; i < lastGameToShowThisCycle && i < data.games.length; i++) {
        var game = data.games[i];
        if ((appid == 0 || game.appid == appid) && (tenPlayers == false || (tenPlayers == true && game.players.length == 9))){
          if (bannedOnly){
            var showThis = false;
            game.players.forEach(function(player){
              if (player.bannedAfterRecording) showThis = true;
            });
            if (showThis) {
              div.appendChild(createGameElement(game));
            }
            else lastGameToShowThisCycle++;
          } else {
            div.appendChild(createGameElement(game));
          }
        } else {
          lastGameToShowThisCycle++;
        }
        gamesShowingCount++; //we're not actually showing the game here, but to move index forward.
      }
      // data.games.forEach(function(game){
      //   if ((appid == 0 || game.appid == appid) && (tenPlayers == false || (tenPlayers == true && game.players.length == 9))){
      //     if (bannedOnly){
      //       var showThis = false;
      //       game.players.forEach(function(player){
      //         if (player.bannedAfterRecording) showThis = true;
      //       });
      //       if (showThis) div.appendChild(createGameElement(game));
      //     } else {
      //       div.appendChild(createGameElement(game));
      //     }
      //   }
      // });
    }
  });
}

function initiateGamesRendering(div, appid, bannedOnly, tenPlayers){
  div.innerHTML = '';
  gamesShowingCount = 0;
  gamesRendering(div, appid, bannedOnly, tenPlayers, false);
}

function loadMore(allPages) {
  var appidFilter = document.querySelector('#appidFilter');
  var newFilter = document.querySelector('#gamesAvailable').value;
  var mainDiv = document.querySelector('div.main');
  var bannedOnly = document.querySelector('#checkbox').checked;
  if (newFilter == 'custom') {
    document.querySelector('#appidFilter').style.display = 'inline';
    newFilter = appidFilter.value;
  } else {
    document.querySelector('#appidFilter').style.display = 'none';
  }
  switch (newFilter) {
    case '730_ten':
      gamesRendering(mainDiv, 730, bannedOnly, true, allPages);
      break;
    default:
      gamesRendering(mainDiv, newFilter, bannedOnly, false, allPages);
      break;
  }
}

function applyFilter() {
  var appidFilter = document.querySelector('#appidFilter');
  var newFilter = document.querySelector('#gamesAvailable').value;
  var mainDiv = document.querySelector('div.main');
  var bannedOnly = document.querySelector('#checkbox').checked;
  if (newFilter == 'custom') {
    document.querySelector('#appidFilter').style.display = 'inline';
    newFilter = appidFilter.value;
  } else {
    document.querySelector('#appidFilter').style.display = 'none';
  }
  switch (newFilter) {
    case '730_ten':
      initiateGamesRendering(mainDiv, 730, bannedOnly, true);
      break;
    default:
      initiateGamesRendering(mainDiv, newFilter, bannedOnly, false);
      break;
  }
}

function renderBanCheker(){
  var body = document.querySelector('.responsive_friendblocks_ctn');
  body.innerHTML = '';

  var extensionInfo = document.createElement('div');
  extensionInfo.style.paddingBottom = "1.5em";
  var InfoMessage = `<p>This page will show only those bans which occured after you played together.</p>
                     <p>Extension records games periodically in the background every few hours, they don't appear here immediately.</p>
                     <p>With your own Steam API key extension will periodically scan every recorded game for recent bans.<br>
                     Without the key it will only scan last 100 players once a day. You can set your API key in settings.</p>`;
  extensionInfo.innerHTML = InfoMessage;

  var filterGames = `<label style="padding-right: 4em"><input type="checkbox" id="checkbox">Games with banned players only</label>
  Filter by game:
  <select id="gamesAvailable">
    <option value="0">All games</option>
    <option value="730">CS:GO</option>
    <option value="730_ten">CS:GO with 10 players</option>
    <option value="570">Dota 2</option>
    <option value="440">Team Fortress 2</option>
    <option value="custom">Filter by appid</option>
  </select>
  <input id="appidFilter" style="display:none" type="text" value="" placeholder="appid, for example 730"/>`;
  extensionInfo.innerHTML += filterGames;
  body.appendChild(extensionInfo);

  var main = document.createElement('div');
  main.classList.add('main');
  body.appendChild(main);

  var pagination = document.createElement('div');
  pagination.innerHTML = `<input id="loadMore" type="button" value="Load ` + loadMoreValue + ` more games">
                          <input id="loadAll" type="button" value="Load all games (may lag)">
                          <div id="paginationNoMore" style="display:none; padding-top:.5em">No more games to load</div>`;
  body.appendChild(pagination);
  document.querySelector('#loadMore').addEventListener("click", function(){loadMore(false)});
  document.querySelector('#loadAll').addEventListener("click", function(){loadMore(true)});

  document.querySelector('#gamesAvailable').addEventListener("change", applyFilter);
  document.querySelector('#appidFilter').addEventListener("change", applyFilter);
  document.querySelector('#checkbox').addEventListener("change", applyFilter);

  initiateGamesRendering(main, 0, false, false);
}
