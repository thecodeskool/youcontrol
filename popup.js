$("body").prepend('<div id="preloader">Loading...</div>');

$(document).ready(function() {
// $(document).ready(function() {
	$(".loader").delay(200).fadeOut("fast");
	$("#overlayer").delay(200).fadeOut("fast");


	console.log('popup button clicked');
	console.log("popup opened");

	function getTabData() {
		let queryInfo = {
			url: "https://www.youtube.com/watch*",
		};

		let totalDuration = '';
		let totalTimeSeconds = 0;

		function sendMessage(tabId, actionName, delay = 0) {
			console.log(`sending message: ${tabId} ${actionName}`);
			chrome.tabs.sendMessage(tabId, { action: actionName }, response => {
				console.log({ response });
				console.log('loading');
				console.log({ actionName });
		    // cb();
				// location.reload(true);
				// getTabData();
		    setTimeout(function() { 
		      // timerUpdate(tabId, totalTimeSeconds);
		      // sendResponse(true);
		      console.log("loading again");
		      location.reload();
		    }, delay);

			});
		}

		function sendMessageNoReload(tabId, actionName) {
			console.log(`sending message: ${tabId} ${actionName}`);
			chrome.tabs.sendMessage(tabId, { action: actionName }, response => {
				console.log({ response });
				// location.reload();
			});
		}

		function getInitialVariables(tabId, cb) {
			const actionList = ['getVolume', 'getChannelName', 'getPlayStatus', 'getLikeStatus', 'getDislikeStatus', 'getTotalDuration'];
			let actionParams = { volume: 50, channel: '', playStatus: true, likeStatus: false, dislikeStatus: false, totalDuration: '' };
			console.log({ actionParams });
			chrome.runtime.sendMessage({ action: 'getEmail' });
			actionParams['email'] = localStorage.getItem('email');

			chrome.tabs.sendMessage(tabId, { action: 'isMute' }, response => {
				actionParams['isMute'] = response;
				console.log({ actionParams, response });
				chrome.tabs.sendMessage(tabId, { action: 'getChannelName' }, response => {
					actionParams['channel'] = response;
					console.log({ actionParams, response });
					chrome.tabs.sendMessage(tabId, { action: 'getPlayStatus' }, response => {
						actionParams['playStatus'] = response;
						console.log({ actionParams, response });
						chrome.tabs.sendMessage(tabId, { action: 'getLikeStatus' }, response => {
							actionParams['likeStatus'] = response;
							console.log({ actionParams, response });
							chrome.tabs.sendMessage(tabId, { action: 'getDislikeStatus' }, response => {
								actionParams['dislikeStatus'] = response;
								console.log({ actionParams, response });
								chrome.tabs.sendMessage(tabId, { action: 'getSubscriptionStatus', channelName: actionParams['channel'] }, response => {
									actionParams['subscriptionStatus'] = response;
									console.log({ actionParams, response });
									chrome.tabs.sendMessage(tabId, { action: 'getNumberOfViews' }, response => {
										actionParams['numViews'] = response;
										console.log({ actionParams, response });
										chrome.tabs.sendMessage(tabId, { action: 'getNumberOfSubs' }, response => {
											actionParams['numSubs'] = response;
											console.log({ actionParams, response });
											chrome.tabs.sendMessage(tabId, { action: 'getTitle' }, response => {
												actionParams['title'] = response;
												chrome.tabs.sendMessage(tabId, { action: 'getPrevAndNextInfo' }, response => {
													actionParams['nextVideo'] = response['nextVideo'] || '';
													actionParams['prevVideo'] = response['prevVideo'];
													localStorage.setItem(`nextVideo-${tabId}`, actionParams['nextVideo']);
													localStorage.setItem(`prevVideo-${tabId}`, actionParams['prevVideo']);

													console.log({ actionParams, response });
													chrome.tabs.sendMessage(tabId, { action: 'getTotalDuration' }, response => {
														console.log({ totalDurationResponse: response });
														const time = parseInt(response);
														totalTimeSeconds = time;
														let timeMins = Math.floor(time/60);
														let timeSeconds = Math.floor(time - timeMins * 60);
														if (timeSeconds.toString().length === 1) {
															timeSeconds = `0${timeSeconds}`;
														}
														if (timeMins.toString().length === 1) {
															timeMins = `0${timeMins}`;
														}

														const timeFinal = `${timeMins}:${timeSeconds}`;
														actionParams['totalDuration'] = timeFinal;
														return cb(actionParams);
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		}

		function processTitle(title) {
			if (title && title.length >= 68) {
				title = title.slice(0,68) + '...';
			}
			return title;
		}

		function processChannelName(channel) {
			if (channel && channel.length > 17) {
				channel = channel.slice(0, 17) + '...';
			}
			return channel;
		}

		function printTabs(tabs) {
			let volumes = {};
			let channelNames = {};

			function populateData(tab, cb, cb2) {
				let tabId = tab['id'];
				console.log('firstTabId:', tabId);
				// chrome.tabs.sendMessage(tabId, { action: 'getVolume' }, response => {
				getInitialVariables(tabId, response => {
					console.log({ response });
					volumes[tabId] = response['volume'];
					const volumeValue = response['volume'];
					const playStatus = response['playStatus'];
					const likeStatus = response['likeStatus'];
					const dislikeStatus = response['dislikeStatus'];
					const numViews = response['numViews'];
					const numSubs = response['numSubs'];
					const loopedStatus = localStorage.getItem(`looped-${tabId}`);
					totalDuration = response['totalDuration'];
					const subscriptionStatus = response['subscriptionStatus'];
					const nextVideo = response['nextVideo'];
					const prevVideo = response['prevVideo'];
					const isMute = response['isMute'];
					let title = response['title'];

					console.log({ loopedStatus });
					const email = response['email'] || 'YC';
					let emailFirstLetter = email[0].toUpperCase();
					if (emailFirstLetter == null) {
						emailFirstLetter = 'YC';
					}

					// document.getElementById('user-profile-text').innerHTML = emailFirstLetter;

					chrome.tabs.sendMessage(tabId, { action: 'getChannelName' }, response => {
						console.log({ response, tabId });
						channelNames[tabId] = response;
						let channelName = channelNames[tabId];
						console.log({ volumeValue, channelName });
						// let title = tab['title'].slice(0, tab['title'].length - 10);
						title = processTitle(title);
						channelName = processChannelName(channelName);

						const videoId = (tab['url'].split('?v=').pop()).split('&')[0];
						const imgSrc = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
						let tabList = `
						<div class="tab-container-box" id=container-box-${tabId}>
						<div id=tab-${tabId} class="tab-tile">
						<li style="list-style-type:none;">
							<div class="thumbnail">
								<img src=${imgSrc} alt="thumbnail" width="90" >
							</div>
							<div class="empty-before-title"></div>
							<p class="title" id="title-tile-${tabId.toString()}">${title}</p>
							<div class="current-time" id="current-time-${tabId.toString()}"></div>
							<div class="total-time" id="total-time-${tabId.toString()}"><span class="total-time-text">/${totalDuration}</span> &#0149;  <b>${numViews}</b> views</div>
							<p class="channelName" id="channel-tile-${tabId.toString()}">${channelName}</p>`;

							if (subscriptionStatus == false) {
								tabList = `${tabList}<button class="subscribe-button" id="tab-subscribe-${tabId.toString()}" title="Subscribe to this channel" disabled>${numSubs}<span class="subscribe-button-popup" style="position: element("tab-button-subscribe-${tabId.toString()}")"><span class="popup-header">Install YouControl Pro to unlock this feature!</span></button>`;
							} else {
								tabList = `${tabList}<button class="subscribed-button" id="tab-subscribed-${tabId.toString()}" title="Subscribed to this channel" disabled>${numSubs}</button>`;
							}

							if (loopedStatus == "true") {
								tabList = `${tabList}<button class="looped-button" id="tab-looped-${tabId.toString()}" title="This video is on repeat"></button>`;
							} else {
								tabList = `${tabList}<button class="loop-button" id="tab-loop-${tabId.toString()}" title="Repeat this video"></button>`;
							}


							tabList = `${tabList}
							<div class="clearfix"></div>

							<div class="clearfix"></div>`;

							tabList = `${tabList}<div class="empty-dock" style="height: 5px;"></div>`;

							if (likeStatus == true) {
							tabList = `${tabList}<button class="liked-button" id="tab-button-liked-${tabId.toString()}" title="You like this video" disabled><span class="liked-button-popup" style="position: element("tab-button-liked-${tabId.toString()}")"><span class="popup-header">Install YouControl Pro to unlock this feature!</span></button>`;
							} else {
							tabList = `${tabList}<button class="like-button" id="tab-button-like-${tabId.toString()}" title="Like this video" disabled><span class="like-button-popup" style="position: element("tab-button-like-${tabId.toString()}")"><span class="popup-header">Install YouControl Pro to unlock this feature!</span></button>`;
							}

							tabList = `${tabList}<button class="watch-later-button" id="tab-button-watch-later-${tabId.toString()}" title="Add this video to watch later" disabled><span class="watch-later-button-popup" style="position: element("tab-button-watch-later-${tabId.toString()}")"><span class="popup-header">Install YouControl Pro to unlock this feature!</span></button>`;

							tabList = `${tabList}<button class="previous-button" id="tab-button-prev-${tabId.toString()}"><span class="prev-button-popup" style="position: element("tab-button-prev-${tabId.toString()}")"><span class="popup-header">Previous:</span> ${prevVideo}</span></button>
							`;
							// tabList = `${tabList}<div class="current-time" id="current-time-${tabId.toString()}"></div>`;
							// tabList = `${tabList}<div class="total-time" id="total-time-${tabId.toString()}">/${totalDuration}</div> `
							

							if (playStatus == true) {
							tabList = `${tabList}<button class="stop-button" id="tab-button-stop-${tabId.toString()}" title="Pause this video"></button>`
							} else {
							tabList = `${tabList}<button class="play-button" id="tab-button-play-${tabId.toString()}" title="Resume this video"></button>`
							}
							// tabList = `${tabList}<button class="subscribe-button" id="tab-subscribe-${tabId.toString()}">Subscribe</button>`
							
							// <div class="next-button-container">
							// </div>
							// <button class="next-button" id="tab-button-next-${tabId.toString()}"><span class="next-button-popup"><img src=${imgSrc} alt="thumbnail" width="50" ><span class="popup-header">Next Up:</span> ${nextVideo}</span></button>

							tabList = `${tabList}
							<button class="next-button" id="tab-button-next-${tabId.toString()}"><span class="next-button-popup" style="position: element("tab-button-next-${tabId.toString()}")"><span class="popup-header">Next Up:</span> ${nextVideo}</span></button>
							`;

							// if (likeStatus == true) {
							// tabList = `${tabList}<button class="liked-button" id="tab-button-liked-${tabId.toString()}"></button>`;
							// } else {
							// tabList = `${tabList}<button class="like-button" id="tab-button-like-${tabId.toString()}"></button>`;
							// }
							
							if (isMute == true) {
								// tabList = `${tabList}<button class="unmute-button" id="tab-button-unmute-${tabId.toString()}" title="Unmute this video"></button>`;
								tabList = `${tabList}<input type="button" class="unmute-button" id="tab-button-unmute-${tabId.toString()}" title="Unmute this video" disabled>`;
							} else {
								// tabList = `${tabList}<button class="mute-button" id="tab-button-mute-${tabId.toString()}" title="Mute this video"></button>`;
								tabList = `${tabList}<input type="button" class="mute-button" id="tab-button-mute-${tabId.toString()}" title="Mute this video" disabled>`;
							}
							if (dislikeStatus == true) {
							tabList = `${tabList}<button class="disliked-button" id="tab-button-disliked-${tabId.toString()}" title="You dislike this video" disabled><span class="disliked-button-popup" style="position: element("tab-button-disliked-${tabId.toString()}")"><span class="popup-header">Install YouControl Pro to unlock this feature!</span></button>`
							} else {
							tabList = `${tabList}<button class="dislike-button" id="tab-button-dislike-${tabId.toString()}" title="Dislike this video" disabled><span class="dislike-button-popup" style="position: element("tab-button-dislike-${tabId.toString()}")"><span class="popup-header">Install YouControl Pro to unlock this feature!</span></button>`
							}
							// tabList = `${tabList}<button class="seek-minus-five-button" id="tab-button-seek-minus-five-${tabId.toString()}">-5</button>`
						tabList = `${tabList}<div class="card-footer"></div>`
						tabList = `${tabList}
						</li>
						</div>
						</div>`;
						console.log('ending populate');
							// <input type="range" min="1" max="100" value="${volumeValue || 100}" class="slider" id="volume-slider-${tabId.toString()}">
						// document.getElementById("popup-list").children[0].innerHTML += tabList;
						tabMap[tab['id']] = tabList;
						// console.log(`adding for ${tab['id']}`);
						// cb(tab);
						return cb2(tabList);
					});
				});
			}

			function setListeners(tab) {
				console.log(`setListenerTab:  ${tab['id']}`);
				const tabId = tab['id'];
				// const playButtonId = `#tab-button-play-${tabId.toString()}`;
				// const stopButtonId = `#tab-button-stop-${tabId.toString()}`;
				const nextButtonId = `#tab-button-next-${tabId.toString()}`;
				const muteButtonId = `#tab-button-mute-${tabId.toString()}`;
				const unmuteButtonId = `#tab-button-unmute-${tabId.toString()}`;
				const prevButtonId = `#tab-button-prev-${tabId.toString()}`;
				const likeButtonId = `#tab-button-like-${tabId.toString()}`;
				const likedButtonId = `#tab-button-liked-${tabId.toString()}`;
				const dislikeButtonId = `#tab-button-dislike-${tabId.toString()}`;
				const dislikedButtonId = `#tab-button-disliked-${tabId.toString()}`;
				const seekPlusFiveButtonId = `#tab-button-seek-plus-five-${tabId.toString()}`;
				const seekMinusFiveButtonId = `#tab-button-seek-minus-five-${tabId.toString()}`;
				const subscribeButtonId = `#tab-subscribe-${tabId.toString()}`;
				const currentTimeId = `current-time-${tabId.toString()}`;
				const loopButtonId = `#tab-loop-${tabId.toString()}`;
				const loopedButtonId = `#tab-looped-${tabId.toString()}`;
				const watchLaterButtonId = `#tab-button-watch-later-${tabId.toString()}`;

				const playButtonClass = `.play-button`;
				const stopButtonClass = `.stop-button`;
				const loopButtonClass = `.loop-button`;
				const loopedButtonClass = `.looped-button`;
				const prevButtonClass = `.previous-button`;
				const nextButtonClass = `.next-button`;
				const muteButtonClass = `.mute-button`;
				const unmuteButtonClass = `.unmute-button`;
				const likeButtonClass = `.like-button`;
				const likedButtonClass = `.liked-button`;
				const dislikeButtonClass = `.dislike-button`;
				const dislikedButtonClass = `.disliked-button`;
				const subscribeButtonClass = `.subscribe-button`;
				const watchLaterButtonClass = `.watch-later-button`;


				console.log('setting listeners');
				// console.log({ playButtonId, nextButtonId, muteButtonId, prevButtonId, likeButtonId, dislikeButtonId, stopButtonId, likedButtonId, dislikeButtonId, currentTimeId });

				$(playButtonClass).click(function(){
					console.log('play button clicked');
					let playButtonId = `#${$(event.target).attr('id')}`;
					console.log(`playButtonId: ${playButtonId}`);
					id = parseInt(playButtonId.split('-')[playButtonId.split('-').length - 1]);
					sendMessageNoReload(id, 'PLAY');

					const currentStatus = $(playButtonId).css("background-image");

					console.log({ currentStatus });
					const stopImageURL = 'images/stop-icon-new.png';
					const playImageURL = 'images/play-icon-new.png';
					let newImageURL = playImageURL;
					if (currentStatus.includes(playImageURL)) {
						newImageURL = stopImageURL;
					}
					$(playButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(playButtonId).css('background-size', "44px auto");
				});

				$(stopButtonClass).click(function(){
					console.log('stop button clicked');
					let stopButtonId = `#${$(event.target).attr('id')}`;
					console.log(`stopButtonId: ${stopButtonId}`);
					id = parseInt(stopButtonId.split('-')[stopButtonId.split('-').length - 1]);

					sendMessageNoReload(id, 'PLAY');

					const currentStatus = `#${$(stopButtonId).css("background-image")}`;
					console.log({ currentStatus });
					const stopImageURL = 'images/stop-icon-new.png';
					const playImageURL = 'images/play-icon-new.png';
					let newImageURL = stopImageURL;
					if (currentStatus.includes(stopImageURL)) {
						newImageURL = playImageURL;
					}
					$(stopButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(stopButtonId).css('background-size', "44px auto");
				});

				$(loopButtonClass).click(function(){
					console.log('loop button clicked');
					let loopButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(loopButtonId.split('-')[loopButtonId.split('-').length - 1]);

					const currentStatus = $(loopButtonId).css("background-image");
					console.log({ currentStatus });
					const loopedImageURL = 'images/looped-icon.png';
					const loopImageURL = 'images/loop-icon.png';
					let newImageURL = loopImageURL;
					let newLoopValue = false;
					if (currentStatus.includes(loopImageURL)) {
						newImageURL = loopedImageURL;
						newLoopValue = true;
					}
					$(loopButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(loopButtonId).css('background-size', "20px auto");
					localStorage.setItem(`looped-${tabId}`, newLoopValue);
				});

				$(loopedButtonClass).click(function(){
					console.log('looped button clicked');
					let loopedButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(loopedButtonId.split('-')[loopedButtonId.split('-').length - 1]);
					const currentStatus = $(loopedButtonId).css("background-image");

					const loopedImageURL = 'images/looped-icon.png';
					const loopImageURL = 'images/loop-icon.png';
					let newImageURL = loopedImageURL;
					console.log({ newImageURL });
					let newLoopValue = true;

					if (currentStatus.includes(loopedImageURL)) {
						newLoopValue = false;
						newImageURL = loopImageURL;
					}
					$(loopedButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(loopedButtonId).css('background-size', "20px auto");
					localStorage.setItem(`looped-${tabId}`, newLoopValue);
				});

				$(prevButtonClass).click(function(){
					console.log('prev button clicked');
					let id = $(event.target).attr('id');
					id = parseInt(id.split('-')[id.split('-').length - 1]);
					// location.reload();
					// sendMessage(id, 'PREV');
					sendMessage(id, 'reloadPage');
				});
				$(nextButtonClass).click(function(){
					console.log('next button clicked');
					let id = $(event.target).attr('id');
					id = parseInt(id.split('-')[id.split('-').length - 1]);
					// location.reload();
					const elements = document.getElementsByClassName(nextButtonClass);
					if (elements.length > 1) {
						sendMessage(id, 'NEXT', 2500);
					} else {
						sendMessage(id, 'NEXT', 1500);
					}
				});

				$(muteButtonClass).click(function(){
					console.log('mute button clicked');
					let muteButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(muteButtonId.split('-')[muteButtonId.split('-').length - 1]);
					// location.reload();
					sendMessageNoReload(id, 'MUTE');

					const currentStatus = $(muteButtonId).css("background-image");
					console.log({ currentStatus });
					const mutedImageURL = 'images/muted-icon-new.png';
					const muteImageURL = 'images/mute-icon-new.png';
					let newImageURL = muteImageURL;
					if (currentStatus.includes(muteImageURL)) {
						newImageURL = mutedImageURL;
					}
					$(muteButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(muteButtonId).css('background-size', "30px auto");
				});

				$(unmuteButtonClass).click(function(){
					console.log('mute button clicked');
					let unmuteButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(unmuteButtonId.split('-')[unmuteButtonId.split('-').length - 1]);
					// location.reload();
					sendMessageNoReload(id, 'MUTE');

					const currentStatus = $(unmuteButtonId).css("background-image");
					console.log({ currentStatus });
					const mutedImageURL = 'images/muted-icon-new.png';
					const muteImageURL = 'images/mute-icon-new.png';

					let newImageURL = muteImageURL;
					console.log({ newImageURL });

					if (currentStatus.includes(muteImageURL)) {
						newImageURL = mutedImageURL;
					}
					$(unmuteButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(unmuteButtonId).css('background-size', "30px auto");
				});

				$(likeButtonClass).click(function(){
					console.log('like button clicked');
					let likeButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(likeButtonId.split('-')[likeButtonId.split('-').length - 1]);
					// location.reload();
					sendMessageNoReload(id, 'likeVideo');
					const currentStatus = $(likeButtonId).css("background-image");
					console.log({ currentStatus });
					const likedImageURL = 'images/liked-icon-new.png';
					const likeImageURL = 'images/like-icon-new.png';
					let newImageURL = likeImageURL;
					if (currentStatus.includes(likeImageURL)) {
						newImageURL = likedImageURL;
					}
					$(likeButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(likeButtonId).css('background-size', "18px auto");
				});
				$(likedButtonClass).click(function(){
					console.log('liked button clicked');
					let likedButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(likedButtonId.split('-')[likedButtonId.split('-').length - 1]);
					// location.reload();
					sendMessageNoReload(id, 'likeVideo');

					const currentStatus = $(likedButtonId).css("background-image");
					console.log({ currentStatus });
					const likedImageURL = 'images/liked-icon-new.png';
					const likeImageURL = 'images/like-icon-new.png';
					let newImageURL = likeImageURL;
					console.log({ newImageURL });

					if (currentStatus.includes(likeImageURL)) {
						newImageURL = likedImageURL;
					}
					$(likedButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(likedButtonId).css('background-size', "18px auto");

				});

				$(dislikeButtonClass).click(function(){
					console.log('dislike button clicked');
					let dislikeButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(dislikeButtonId.split('-')[dislikeButtonId.split('-').length - 1]);
					// location.reload();
					sendMessageNoReload(id, 'dislikeVideo');

					const currentStatus = $(dislikeButtonId).css("background-image");
					console.log({ currentStatus });
					const dislikedImageURL = 'images/disliked-icon-new.png';
					const dislikeImageURL = 'images/dislike-icon-new.png';
					let newImageURL = dislikeImageURL;
					if (currentStatus.includes(dislikeImageURL)) {
						newImageURL = dislikedImageURL;
					}
					$(dislikeButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(dislikeButtonId).css('background-size', "18px auto");

				});
				$(dislikedButtonClass).click(function(){
					console.log('disliked button clicked');
					let dislikedButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(dislikedButtonId.split('-')[dislikedButtonId.split('-').length - 1]);
					// location.reload();
					sendMessageNoReload(id, 'dislikeVideo');

					const currentStatus = $(dislikedButtonId).css("background-image");
					console.log({ currentStatus });
					const dislikedImageURL = 'images/disliked-icon-new.png';
					const dislikeImageURL = 'images/dislike-icon-new.png';
					let newImageURL = dislikedImageURL;
					if (currentStatus.includes(dislikedImageURL)) {
						newImageURL = dislikeImageURL;
					}
					$(dislikedButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(dislikedButtonId).css('background-size', "25px auto");

				});

				$(seekPlusFiveButtonId).click(function(){
					console.log('seek-plus-five button clicked');
					let id = $(event.target).attr('id');
					id = parseInt(id.split('-')[id.split('-').length - 1]);
					// localStorage.setItem('looped', true);
					// location.reload();
					sendMessage(id, 'seekPlus5');
				});

				$(seekMinusFiveButtonId).click(function(){
					console.log('seek-minus-five button clicked');
					let id = $(event.target).attr('id');
					id = parseInt(id.split('-')[id.split('-').length - 1]);
					// location.reload();
					sendMessage(id, 'seekMinus5');
				});

				$(subscribeButtonClass).click(function(){
					console.log('subscribe button clicked');
					let subscribeButtonId = `#${$(event.target).attr('id')}`;
					id = parseInt(subscribeButtonId.split('-')[subscribeButtonId.split('-').length - 1]);
					// location.reload();
					sendMessageNoReload(id, 'subscribe');

					const currentStatus = $(subscribeButtonId).css("background-image");
					console.log({ currentStatus });
					const subscribedImageURL = 'images/subscribed-icon-new.png';
					// const dislikeImageURL = 'images/dislike-icon-new.png';
					let newImageURL = subscribedImageURL;
					// if (currentStatus.includes(dislikedImageURL)) {
					// 	newImageURL = dislikeImageURL;
					// }
					$(subscribeButtonId).css('background', "url('" + newImageURL + "') no-repeat center");
					$(subscribeButtonId).css('background-size', "70px");
					$(subscribeButtonId).css('padding-bottom', "2px");
				});

				$(watchLaterButtonClass).click(function(){
					console.log('watch later button clicked');
					let id = $(event.target).attr('id');
					id = parseInt(id.split('-')[id.split('-').length - 1]);
					// location.reload();
					sendMessageNoReload(id, 'addToWatchLater');					
				});

				function timerUpdate() {
					chrome.tabs.sendMessage(tabId, { action: 'getCurrentTime' }, response => {
						const currentTimeSeconds = parseInt(response);
						let currentMins = Math.floor(currentTimeSeconds/60);
						let currentSeconds = Math.floor(currentTimeSeconds - (currentMins * 60));
						if (currentSeconds.toString().length === 1) {
							currentSeconds = `0${currentSeconds}`;
						}
						if (currentMins.toString().length === 1) {
							currentMins = `0${currentMins}`;
						}

						const currentTime = `${currentMins}:${currentSeconds}`;

						console.log({ currentTime });
						console.log({ totalDuration });

						// if (loop clicked?) {
						let currentTimeSecPlusOne = currentTimeSeconds + 1;
						const currentMinsPlusOne = Math.floor(currentTimeSecPlusOne/60);
						let currentSecondsPlusOne = Math.floor(currentTimeSecPlusOne - (currentMinsPlusOne * 60));
						if (currentSecondsPlusOne.toString().length === 1) {
							currentSecondsPlusOne = `0${currentSecondsPlusOne}`;
						}


						const currentTimePlusOne = `${currentMinsPlusOne}:${currentSecondsPlusOne}`;


						// if (localStorage.getItem('looped') === "true") {
						// 	console.log(`${totalDuration}, ${currentTimePlusOne}`);
						// 	if (totalTimeSeconds == currentTimeSeconds) {
						// 		console.log('going to reload');
						// 		sendMessage(tabId, 'reloadPage');
						// 	}
						// }
						document.getElementById(currentTimeId).innerHTML = currentTime;
					});
				}

				setInterval(timerUpdate, 1000);
				chrome.runtime.sendMessage({ action: 'looped', tabId, buttonClicked: true, totalTimeSeconds, totalDuration });


			}

			console.log({ volumes });
			console.log({ channelNames });
			console.log({ tabs });
			// tabs = tabs.sort((a, b) => (a.id > b.id) ? 1 : -1);
			console.log('sortedTabs: ', tabs);
			tabMap = {};

			for (var i = 0; i < tabs.length; i++) {
				let tabId = parseInt(tabs[i]['id']);
				console.log('in here', i);
				console.log({ tabId1: tabId });
				console.log(`starting listing for ${tabId}`);
				const tab = tabs[i];
				populateData(tabs[i], setListeners, (tabString) => {
					document.getElementById("popup-list").children[0].innerHTML += tabString;
					console.log(`calling setListeners with ${tab}`);
					setListeners(tab);
					console.log(`adding listing for ${tabId}`);
				});
				// console.log(`completed for ${tabId}`);
			}
			// for(var i=0; i<tabs.length; i++){
			// 	const tabText = tabs[tabs[i]['id']];
			// 	document.getElementById("popup-list").children[0].innerHTML += tabText;
			// }
			console.log('after looping');
			
		}

		chrome.tabs.query(queryInfo, printTabs);

	}

	getTabData();

	const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

	function switchTheme(e) {
		console.log('theme switched')
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark'); //add this
    }
    else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light'); //add this
    }    
	}

	toggleSwitch.addEventListener('change', switchTheme, false);

	const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

	if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
      toggleSwitch.checked = true;
    } else {
    	toggleSwitch.checked = false;
    }
	}

	const themeElement = document.getElementById('theme-switch-wrapper');

	// const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

	// if (currentTheme) {
	// if(document.documentElement.getAttribute('data-theme') == 'dark') {
	// 	themeElement.title = "Switch to light theme";
	// } else {
	// 	themeElement.title = "Switch to dark theme";
	// }
	// }

});