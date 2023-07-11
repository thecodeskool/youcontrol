console.log('background running');

chrome.browserAction.onClicked.addListener(buttonClicked);

function checkTabs(tabs) {
	console.log({ tabs1: tabs });
	for (var i = tabs.length - 1; i >= 0; i--) {
		const tab = tabs[i];
		const tabId = tab.id;
		const loopedTabId = `looped-${tabId}`;
		// const loopedTabId = `looped-${tabId}`;
		if (localStorage.getItem(loopedTabId) == 'true') {
			console.log({ tabId });
			chrome.tabs.sendMessage(tabId, { action: 'getTotalDuration' }, response => {
				console.log({ response });
				const totalTimeSeconds = parseInt(response);

				setInterval(function() { 
					timerUpdate(tabId, totalTimeSeconds);
				}, 1000);
			});
		}
	}
}

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  // if (changeInfo.status == 'complete') {

  //   // do your things

  // }
  console.log('inside tab update event');
  console.log({ tabId, changeInfo, tab });
	let queryInfo = {
		url: "https://www.youtube.com/watch*",
	};
	console.log({ queryInfo });
	chrome.tabs.query(queryInfo, checkTabs);

});

function timerUpdate(tabId, totalTimeSeconds) {
	console.log(`inside timerUpdate - ${tabId}`);
	chrome.tabs.sendMessage(tabId, { action: 'getTotalDuration' }, response => {
		totalTimeSeconds = parseInt(response);
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

			console.log({ currentTime, totalTimeSeconds });

			// if (loop clicked?) {
			let currentTimeSecPlusOne = currentTimeSeconds + 1;
			const currentMinsPlusOne = Math.floor(currentTimeSecPlusOne/60);
			let currentSecondsPlusOne = Math.floor(currentTimeSecPlusOne - (currentMinsPlusOne * 60));
			if (currentSecondsPlusOne.toString().length === 1) {
				currentSecondsPlusOne = `0${currentSecondsPlusOne}`;
			}

			const currentTimePlusOne = `${currentMinsPlusOne}:${currentSecondsPlusOne}`;

			// console.log()
			console.log(`looped-${tabId}`);
			console.log({localStorage: localStorage.getItem(`looped-${tabId}`)});
			if (localStorage.getItem(`looped-${tabId}`) === "true") {
				if (totalTimeSeconds == currentTimeSeconds) {
					console.log('going to reload');
					sendMessage(tabId, 'reloadPage');
				}
			}
			// document.getElementById(currentTimeId).innerHTML = currentTime;
		});
	});
}


function buttonClicked(tab) {
	console.log('buttonClicked')
	let queryInfo = {
		url: "https://www.youtube.com/watch*",
	};
	chrome.tabs.query(queryInfo, printTabs);
  let msg = {
    txt: "hello"
  }
  chrome.tabs.sendMessage(tab.id, msg);
}

function sendMessage(tabId, actionName) {
	console.log(`sending message: ${tabId} ${actionName}`);
	chrome.tabs.sendMessage(tabId, { action: actionName }, response => {
		console.log({ response });
		location.reload();
	});
}

let queryInfo = {
	url: "https://www.youtube.com/watch*",
};

// chrome.runtime.onInstalled.addListener(function(message, sender) {
// 	let queryInfo = {
// 		url: "https://www.youtube.com/watch*",
// 	};
// 	console.log({ queryInfo });
// 	chrome.tabs.query(queryInfo, checkTabs);
// });

console.log({ storage: chrome.storage });
chrome.storage.local.onChanged.addListener(function(changes, namespace) {
	console.log({ changes });
  for (var key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});


console.log('adding listener');
chrome.runtime.onMessage.addListener(function(message, sender) {

	console.log('inside background script. button clicked');	
	console.log({ tabId: message.tabId });
  // if(!message.buttonClicked) return;

  if (message.action == 'looped') {
	  const tabId = message.tabId;
	  const totalTimeSeconds = message.totalTimeSeconds;
	  const totalDuration = message.totalDuration;
		function timerUpdate() {

			chrome.tabs.sendMessage(tabId, { action: 'getCurrentTime' }, response => {
				const currentTimeSeconds = parseInt(response);
				let currentMins = Math.floor(currentTimeSeconds/60);
				let currentSeconds = Math.floor(currentTimeSeconds - (currentMins * 60));
				if (currentSeconds.toString().length === 1) {
					currentSeconds = `0${currentSeconds}`;
				}

				const currentTime = `${currentMins}:${currentSeconds}`;

				console.log({ currentTime33: currentTime });
				console.log({ totalDuration });

				// if (loop clicked?) {
				let currentTimeSecPlusOne = currentTimeSeconds + 1;
				let currentMinsPlusOne = Math.floor(currentTimeSecPlusOne/60);
				let currentSecondsPlusOne = Math.floor(currentTimeSecPlusOne - (currentMinsPlusOne * 60));
				if (currentSecondsPlusOne.toString().length === 1) {
					currentSecondsPlusOne = `0${currentSecondsPlusOne}`;
				}
				if (currentMinsPlusOne.toString().length === 1) {
					currentMinsPlusOne = `0${currentMinsPlusOne}`;
				}


				const currentTimePlusOne = `${currentMinsPlusOne}:${currentSecondsPlusOne}`;

				// console.log()
				console.log(`${totalDuration}, ${currentTimePlusOne}`);

				if (localStorage.getItem(`looped-${tabId}`) === "true") {
					console.log(`${totalDuration}, ${currentTimePlusOne}`);
					if (totalTimeSeconds == currentTimeSeconds) {
						console.log('going to reload');
						sendMessage(tabId, 'reloadPage');
					}
				}
				// document.getElementById(currentTimeId).innerHTML = currentTime;
			});
		}

		if (localStorage.getItem(`looped-${tabId}`) === "true") {
			setInterval(timerUpdate, 1000);
		}

  } else if (message.action == 'getEmail') {
			localStorage.setItem('email', 'yc@gmail.com');
		// chrome.identity.getProfileUserInfo(function (user) {
		// 	console.log({ user: user.email, user1: user });
		// 	localStorage.setItem('email', user.email);
		// });
  }


      // Do your stuff
});

// chrome.runtime.sendMessage({ tabId: 3063, buttonClicked: true, totalTimeSeconds: 776, totalDuration: "12:56" });
