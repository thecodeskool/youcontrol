console.log("Chrome extension go?");

// TODO: unsubscribe feature
// chrome.runtime.sendMessage({ action: 'hello' });


chrome.runtime.onMessage.addListener(gotMessage);

function formatNumberToViews(labelValue) {
  // Nine Zeroes for Billions
  return Math.abs(Number(labelValue)) >= 1.0e+9

  ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(1) + "B"
  // Six Zeroes for Millions 
  : (Math.abs(Number(labelValue)) >= 1.0e+6)

  ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(1) + "M"
  // Three Zeroes for Thousands
  : (Math.abs(Number(labelValue)) >= 1.0e+3)

  ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(1) + "K"

  : Math.abs(Number(labelValue));
}


function gotMessage(message, sender, sendResponse) {
  console.log({ message, sender, sendResponse });
  console.log('action ', message['action'])
  if (message['action'] == 'getVolume') {
    console.log('inside getVolume');
    console.log(document.getElementsByClassName("ytp-volume-panel")[0].getAttribute('aria-valuetext'));
    const volumeValue = (document.getElementsByClassName("ytp-volume-panel")[0].getAttribute('aria-valuetext') || '').split('%')[0];
    console.log({ volumeValue });
    // volumeValue = parseInt(volumeValue);
    console.log({ volumeValue });
    sendResponse(volumeValue);
    return;
  }
  else if (message['action'] == 'getChannelName') {
    const channelName = document.querySelectorAll("ytd-channel-name#channel-name.style-scope.ytd-video-owner-renderer")[0].innerText
    sendResponse(channelName);
    return;
  }
  else if (message['action'] == 'PLAY') {
  	console.log('inside play');
		document.getElementsByClassName('ytp-play-button ytp-button')[0].click();
		sendResponse(true);
  }
  else if (message['action'] == 'NEXT') {
  	console.log('inside next');
		document.getElementsByClassName('ytp-next-button ytp-button')[0].click();
    setTimeout(function() { 
      // timerUpdate(tabId, totalTimeSeconds);
      sendResponse(true);
    }, 1000);

		// sendResponse(true);
  }
  else if (message['action'] == 'PREV') {
  	console.log('inside prev');
		document.getElementsByClassName('ytp-prev-button ytp-button')[0].click();
		sendResponse(true);
  } 
  else if (message['action'] == 'MUTE') {
  	console.log('inside mute');
  	document.getElementsByClassName('ytp-mute-button ytp-button')[0].click();
  }
  else if (message['action'] == 'isMute') {
    console.log('inside mute');
    const ariaLabel = document.getElementsByClassName('ytp-mute-button ytp-button')[0].getAttribute('aria-label');
    if (ariaLabel.includes("Unmute")) {
      return sendResponse(true);
    }
    return sendResponse(false);
  }  
  else if (message['action'] == 'changeVolume') {
    console.log('inside changeVolume');
    
  }
  else if (message['action'] == 'likeVideo') {
    console.log('inside likeVideo');
    document.querySelectorAll('[aria-label^="like this video"]')[0].click();
    sendResponse(true);
  }
  else if (message['action'] == 'dislikeVideo') {
    console.log('inside dislikeVideo');
    document.querySelectorAll('[aria-label^="dislike this video"]')[0].click();
    sendResponse(true);
  }
  else if (message['action'] == 'getPlayStatus') {
    console.log('inside getPlayStatus');
    const title = document.querySelectorAll('.ytp-play-button.ytp-button')[0].getAttribute('title') || null;
    console.log({ title });
    if (title && title.startsWith("Pause")) {
      sendResponse(true);
    } else {
      sendResponse(false);
    }
  }
  else if (message['action'] == 'getLikeStatus') {
    console.log('inside getLikeStatus');
    const div = document.querySelector('.style-scope.ytd-toggle-button-renderer.style-default-active [aria-label^="like"]');
    // const div2 = document.querySelectorAll('.style-scope.ytd-toggle-button-renderer.style-default-active [aria-label^="like"]');
    if (div == null) {
      console.log('inside getlikestatus returning false');
      sendResponse(false);
    } else {
      sendResponse(true);
    }
  }
  else if (message['action'] == 'getDislikeStatus') {
    console.log('inside getDislikeStatus');
    const div = document.querySelector('.style-scope.ytd-toggle-button-renderer.style-default-active [aria-label^="dislike"]');
    if (div == null) {
      sendResponse(false);
    } else {
      sendResponse(true);
    }

  }
  else if (message['action'] == 'getCurrentTime') {
    console.log('inside getCurrentTime');
    let response = document.querySelector('.video-stream');
    response = response.currentTime;
    response = response || 0;
    console.log({ response });
    sendResponse(response);
  }
  else if (message['action'] == 'getTotalDuration') {
    console.log('inside getTotalDuration');
    const div = document.querySelector('.video-stream');
    // console.log({ div });
    console.log({ attributes: div.currentTime, attributesDuration: div.duration });
    const response = div.duration;

    console.log({ response });
    sendResponse(response);
  }
  else if (message['action'] == 'reloadPage') {
    console.log('reloading page');
    location.reload();
    // document.querySelector('[title^="Replay"]').click();
    // setTimeout(
    //   function() {
    //     console.log('about to click.');
    //     console.log(`${document.querySelector('[title^="Replay"]')}`);
    //     document.querySelector('[title^="Replay"]').click();
    //   }, 1000);
    sendResponse('reloaded');
  }
  else if (message['action'] == 'seekPlus5') {
    const ytplayer = document.querySelector(".html5-video-player:not(.addedupdateevents)");
    ytplayer.seekTo(ytplayer.getCurrentTime() + 5);
    sendResponse('success');
  }
  else if (message['action'] == 'seekMinus5') {
    debugger;
    // const ytplayer = cdocument.querySelector(".html5-video-player").seekTo;
    console.log({ ytplayer: document.querySelector(".html5-video-player"), seekTo: document.querySelector(".html5-video-player").seekTo });
    const player = document.getElementsByClassName("html5-video-player ytp-transparent ytp-hide-info-bar ytp-large-width-mode ad-created playing-mode iv-module-loaded ytp-autohide")[0];
    console.log({ player });
    // const currentTime = document.querySelector(".html5-video-player:not(.addedupdateevents)").getCurrentTime();
    // console.log('currentTime: ', ytplayer.getCurrentTime()), currentTime;
    // ytplayer.seekTo(100);
    // ytplayer.seekTo(ytplayer.getCurrentTime() - 5);
    sendResponse('success');
  }
  else if (message['action'] == 'getVolume') {
    const ytplayer = document.querySelector(".html5-video-player:not(.addedupdateevents)");
    const volume = ytplayer.getVolume();
    sendResponse(volume);
  }
  else if (message['action'] == 'setVolume') {
    const ytplayer = document.querySelector(".html5-video-player:not(.addedupdateevents)");
    ytplayer.setVolume(message['volume']);
    sendResponse('success');
  }
  else if (message['action'] == 'getSubscriptionStatus') {
    const status = document.querySelectorAll("ytd-subscribe-button-renderer.style-scope.ytd-video-secondary-info-renderer")[0].innerText;
    if (status == 'SUBSCRIBED') {
      sendResponse(true);
    }
    sendResponse(false);
  }
  else if (message['action'] == 'subscribe') {
    const subArr = document.querySelectorAll('[aria-label^="Subscribe to"]');
    const reqElement = subArr[subArr.length - 1];
    reqElement.click();
    sendResponse('success');
  }
  else if (message['action'] === 'getNumberOfViews') {
    const numViews = formatNumberToViews(Number(document.getElementsByClassName("view-count style-scope yt-view-count-renderer")[0].innerText.split(" ")[0].replace(/,/g, '')));
    sendResponse(numViews);
  }
  else if (message['action'] === 'getNumberOfSubs') {
    // const numSubs = document.getElementsByClassName("deemphasize style-scope yt-formatted-string")[0].innerText;
    const subsText = document.getElementById("owner-sub-count").innerText;
    const numSubs = subsText.split(" ")[0];
    sendResponse(numSubs);
  }
  else if (message['action'] == 'getPrevAndNextInfo') {
    const res = {};

    const nextVideo = document.getElementsByClassName("ytp-next-button ytp-button")[0].getAttribute("data-tooltip-text");
    res['nextVideo'] = nextVideo;

    const prevVideo = document.getElementsByClassName("ytp-prev-button ytp-button")[0].getAttribute("data-tooltip-text") || 'Go to start';
    res['prevVideo'] = prevVideo;
    sendResponse(res);
  }
  else if (message['action'] === 'addToWatchLater') {
    document.querySelectorAll('button[title^="Watch later"]')[0].click();
    sendResponse('success');
  }
  else if (message['action'] === 'noop') {
    sendResponse('noop');
  }
  else if (message['action'] == 'getTitle') {
    const title = document.getElementsByClassName('title style-scope ytd-video-primary-info-renderer')[0].getElementsByClassName("style-scope ytd-video-primary-info-renderer")[0].innerText || '';
    sendResponse(title);
  }


}

function sendVolumeMessage() {

}

function sendMessage() {
  sendVolumeMessage();
}