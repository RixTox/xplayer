(function() {
	// Private variables
	var
	xPlayer = function xPlayer(args) {
		return xPlayer.fn.init(args);
	},
	thisObj = this,
	thisArgs = {},
	playHistory = [],
	isClickingProcessBar = false,
	isDraggingProcessBar = false,
	playmodes = {
		loop: {
			title: 'Loop list',
			style: 'icon-exchange'
		},
		random: {
			title: 'Random',
			style: 'icon-random'
		},
		loopone: {
			title: 'Loop one track',
			style: 'icon-refresh'
		},
		once: {
			title: 'Play list once',
			style: 'icon-reorder'
		}

	},
	defaultArgs = {
		options: {
			playmode:           'loop',
			listTitle:          '#{artist} - #{title}',
			autoplay:           false,
			startindex:         0
		},
		html: {
			audio:              $('<audio preload class="xPlayer-file-audio"></audio>')[0],
			info: {
				wrapper:        $('<div class="xPlayer-info">')[0],
				inner:          $('<div class="xPlayer-info-inner">')[0],
				thumbnail:      $('<img class="xPlayer-info-thumbnail" style="display: none;">')[0],
				title:          $('<div class="xPlayer-info-text xPlayer-info-title">')[0],
				album:          $('<div class="xPlayer-info-text xPlayer-info-album">')[0],
				artist:         $('<div class="xPlayer-info-text xPlayer-info-artist">')[0],
				source:         $('<div class="xPlayer-info-text xPlayer-info-source">')[0]
			},
			control: {
				wrapper:        $('<ul class="xPlayer-controls">')[0],
				play:           $('<li class="xPlayer-control-play"><i class="icon-play">')[0],
				pause:          $('<li class="xPlayer-control-pause" style="display:none;"><i class="icon-pause">')[0],
				mode:           $('<li class="xPlayer-control-mode"><i class="icon-exchange">')[0],
				stop:           $('<li class="xPlayer-control-stop"><i class="icon-stop">')[0],
				previous:       $('<li class="xPlayer-control-previous"><i class="icon-step-backward">')[0],
				next:           $('<li class="xPlayer-control-next"><i class="icon-step-forward">')[0]
			},
			progress: {
				wrapper:        $('<div class="xPlayer-progress-container">')[0],
				text:           $('<div class="xPlayer-progress-text">')[0],
				current:        $('<span class="xPlayer-progress-current">00:00</span>')[0],
				separator:      $('<span class="xPlayer-progress-separator"> / </span>')[0],
				duration:       $('<span class="xPlayer-progress-duration">00:00</span>')[0],
				progressbar:    $('<div class="xPlayer-progress-bar" style="width: 0;">')[0]
			},
			playlist: {
				wrapper:        $('<div class="xPlayer-playlist-container">')[0],
				list:           $('<ul class="xPlayer-playlist">')[0]
			}
		},

		callbacks: {
			audio: {
				play:           function(e) {},
				pause:          function(e) {},
				stop:           function(e) {},
				ended:          function(e) {},
				loadstart:      function(e) {},
				timeupdate:     function(e) {},
				durationchange: function(e) {}
			}
		}
	},
	callbacks = {
		audio: {
			play: function(e) {
				$(thisObj.html.control.play).hide();
				$(thisObj.html.control.pause).show();
			},

			pause: function(e) {
				$(thisObj.html.control.pause).hide();
				$(thisObj.html.control.play).show();
			},

			stop: function(e) {},

			ended: function(e) {
				thisObj.next();
			},

			loadstart: function(e) {
				var trackIndex = thisObj.currentTrackIndex();
				var trackInfo = thisObj.trackList[trackIndex];
				$(thisObj.html.info.title)
					.html(trackInfo['title'])
					.attr('title', trackInfo['title']);
				$(thisObj.html.info.album)
					.html(trackInfo['album'])
					.attr('title', trackInfo['album']);
				$(thisObj.html.info.artist)
					.html(trackInfo['artist'])
					.attr('title', trackInfo['artist']);
				$(thisObj.html.info.source)
					.html($('<a>').html(trackInfo['reference_title'])
					.attr({'href': trackInfo['reference_url'], 'target': '_blank'}));
				$(thisObj.html.info.thumbnail)[0].src = trackInfo['thumbnail'];
				$(thisObj.html.info.thumbnail)[0].style.display = 'inline';
				if(playHistory[playHistory.length - 1] != trackIndex)
					playHistory.push(trackIndex);
			},

			canplay: function(e) {
				if(thisObj.options.autoplay)
					thisObj.play();
			},

			timeupdate: function(e) {
				if(!isDraggingProcessBar) {
					$(thisObj.html.progress.progressbar)
						.css('width', (thisObj.audio.currentTime / thisObj.audio.duration) * 100 + '%');
				}
				$(thisObj.html.progress.current)
					.html(toHHMMSS(thisObj.audio.currentTime));
			},

			durationchange: function(e) {
				$(thisObj.html.progress.duration)
					.html(toHHMMSS(thisObj.audio.duration));
			}

		},
		info: {
			thumbnail: {
				error: function(e) {
					typeof thisObj.options.thumbnailbg === 'string'
						? (this.src = thisObj.options.thumbnailbg, this.style.display = 'inline')
						: this.style.display = 'none';
				}
			}
		},
		control: {
			play: {
				click: function(e) {
					if(!thisObj.trackList.length)
						return;
					(thisObj.currentTrackIndex < 0) ? thisObj.play(0) : thisObj.play();
				}
			},
			pause: {
				click: function(e) {
					thisObj.pause();
				}
			},
			mode: {
				click: function(e) {
					thisObj.nextPlayMode();
				}
			},
			stop: {
				click: function(e) {
					thisObj.stop();
				}
			},
			previous: {
				click: function(e) {
					thisObj.previous();
				}
			},
			next: {
				click: function(e) {
					thisObj.next();
				}
			}
		},
		progress: {
			wrapper: {
				mousedown: function(){
					isClickingProcessBar = true;
					var
					mousemoveCallback = function(e) {
						if(isClickingProcessBar) {
							isDraggingProcessBar = true;
							var
							progressBarX = $(thisObj.html.progress.wrapper).offset().left,
							progressBarClickX = e.pageX - progressBarX;
							$(thisObj.html.progress.progressbar)
								.css('width', progressBarClickX + 'px');
						}
					},
					mouseupCallback = function(e) {
						if(isDraggingProcessBar || isClickingProcessBar) {
							isClickingProcessBar = false;
							isDraggingProcessBar = false;
							$(document).off('mousemove', mousemoveCallback);
							$(document).off('mouseup', mouseupCallback);
							var
							progressBarX = $(thisObj.html.progress.wrapper).offset().left,
							progressBarClickX = e.pageX - progressBarX;
							thisObj.audio.currentTime = (progressBarClickX / 
								$(thisObj.html.progress.wrapper)[0]
								.offsetWidth) * thisObj.audio.duration;
						}
					};
					$(document)
						.mousemove(mousemoveCallback)
						.mouseup(mouseupCallback);
				}
			}
		}
	};

	xPlayer.fn = xPlayer.prototype = {
		// Public properties
		audio: {},
		trackList: [],
		html: {},

		// Public functions
		init: function(args) {
			thisObj = this;
			switch(typeof args) {
				case 'undefined':
					return;
				case 'string':
					args = {options: {target: args}};
					break;
			}
			$.extend(true, thisArgs, defaultArgs, args);
			thisObj.audio = thisArgs.html.audio;
			thisObj.html = thisArgs.html;
			thisObj.callbacks = thisArgs.callbacks; // The public callbacks
			thisObj.options = thisArgs.options;
			thisObj.set(thisArgs.options.target);

			var json = thisObj.options.json;
			if(typeof json === 'string' && json.length)
				thisObj.loadJSON(json);
		},

		set: function(target) {
			thisObj.html.xPlayer = $(target)
				.removeClass()
				.html('')
				.addClass('xPlayer')
				.append(
					$(thisObj.html.info.wrapper).append(
						thisObj.html.info.thumbnail,
						$(thisObj.html.info.inner).append(
							thisObj.html.info.title,
							thisObj.html.info.album,
							thisObj.html.info.artist,
							thisObj.html.info.source
						)
					),
					$(thisObj.html.control.wrapper).append(
						thisObj.html.control.previous,
						thisObj.html.control.play,
						thisObj.html.control.pause,
						thisObj.html.control.mode,
						thisObj.html.control.stop,
						thisObj.html.control.next
					),
					$(thisObj.html.progress.wrapper).append(
						$(thisObj.html.progress.text).append(
							thisObj.html.progress.current,
							thisObj.html.progress.separator,
							thisObj.html.progress.duration
						),
						thisObj.html.progress.progressbar
					),
					$(thisObj.html.playlist.wrapper).append(
						thisObj.html.playlist.list
					),
					thisObj.html.audio
				);
			thisObj.setPlayMode();
			var addEvents = function(callbackpath) {
				var node = callbacks;
				if(typeof callbackpath !== 'undefined') {
					for(var i in callbackpath) {
						node = node[callbackpath[i]];
					}
				} else {
					var callbackpath = [];
				}
				if(typeof node === 'function') {
					var element = thisObj.html,
						eventKey = callbackpath[callbackpath.length - 1];
					for(var i = 0; i < callbackpath.length - 1; ++i) {
						element = element[callbackpath[i]];
					}
					$(element).on(eventKey, node);
					//$(path).on(node, )
				} else {
					for(var key in node) {
						var newpath = callbackpath.slice(0);
						newpath.push(key);
						addEvents(newpath);
					}
				}
			};

			addEvents();
		},

		loadJSON: function(url) {
			$.getJSON(url, function(data) {
				$(data).each(function() {
					var title = thisObj.options.listTitle;
					for(var key in this)
						title = title.replace(new RegExp('#{' + key + '}', 'ig'), this[key]);
					title = title.replace(/#{\w*}/, '');
					this.html = $('<li>').attr('title', title)
						.html(title)
						.click(
							function(trackIndex) {
								return function() {
									thisObj.play(trackIndex);
								};
							}(thisObj.trackList.length)
						)[0];
					this.html.trackIndex = thisObj.trackList.length;
					$(thisObj.html.playlist.list).append(this.html);
					thisObj.trackList.push(this);
				});
				thisObj.load(thisObj.options.startindex);
			});
		},

		load: function(trackIndex) {
			thisObj.audio.src = thisObj.trackList[trackIndex].url;
			thisObj.audio.load();
			thisObj.switchCurrentTrackStyle(trackIndex);
		},

		play: function(trackIndex) {
			if(typeof trackIndex != "undefined") {
				if(trackIndex >= 0 && trackIndex < thisObj.trackList.length) {
					thisObj.load(trackIndex);
				} else {
					return thisObj.stop();
				}
			}
			thisObj.audio.play();
		},

		pause: function() {
			thisObj.audio.pause();
		},

		stop: function() {
			thisObj.pause();
			if(thisObj.audio.currentTime)
				thisObj.audio.currentTime = 0;
			raiseCallback(callbacks.onStop);
		},

		previous: function() {
			thisObj.play(thisObj.previousTrackIndex());
		},

		next: function() {
			thisObj.play(thisObj.nextTrackIndex());
		},

		currentTrackItem: function() {
			return getDOM('.xPlayer-current-track');
		},

		currentTrackIndex: function() {
			var currentTrack = thisObj.currentTrackItem();
			return currentTrack.length ? currentTrack[0].trackIndex : -1;
		},

		nextTrackIndex: function(order) {
			var mode = typeof order === 'undefined' ? thisObj.options.playmode : order,
				currentTrack = thisObj.currentTrackItem(),
				currentTrackIndex = thisObj.currentTrackIndex();
			if(!thisObj.trackList.length > 1 || !currentTrack.length)
				return -1;
			var
			listOrderNextIndex = function() {
				var next = $(currentTrack).next();
				return next.length ? next[0].trackIndex : 0;
			},
			randomOrderNextIndex = function() {
				var retval = Math.floor(Math.random() * thisObj.trackList.length);
				return (retval != currentTrackIndex ? retval : randomOrderNextIndex());
			};
			switch(mode) {
				case 'loop':
					return listOrderNextIndex();
				case 'random':
					return randomOrderNextIndex();
				case 'loopone':
					return currentTrackIndex;
				case 'once':
					var nextIndex = listOrderNextIndex();
					return nextIndex > 0 ? nextIndex : -1;
			}
		},

		previousTrackIndex: function(order) {
			var mode = typeof order === 'undefined' ? thisObj.options.playmode : order,
				currentTrack = thisObj.currentTrackItem(),
				currentTrackIndex = thisObj.currentTrackIndex();
			if(!thisObj.trackList.length > 1 || !currentTrack.length)
				return -1;
			var
			listOrderPreviousIndex = function() {
				var prev = $(currentTrack).prev();
				return prev.length ? prev[0].trackIndex : thisObj.trackList.length - 1;
			},
			randomOrderPreviousIndex = function() {
				var retval = playHistory.pop();
				return playHistory.length ? playHistory.pop() : thisObj.nextTrackIndex('random');
			};
			switch(mode) {
				case 'loop': case 'once':
					return listOrderPreviousIndex();
				case 'random':
					return randomOrderPreviousIndex();
				case 'loopone':
					return currentTrackIndex;
			}
		},

		nextPlayMode: function() {
			var modes = [];
			for(var key in playmodes)
				modes.push(key);
			var nextIndex = modes.indexOf(thisObj.options.playmode) + 1;
			if(nextIndex >= modes.length)
				nextIndex = 0;
			thisObj.setPlayMode(modes[nextIndex]);
		},

		setPlayMode: function(arg) {
			var mode = typeof arg === 'string' ? arg : thisObj.options.playmode;
			thisObj.options.playmode = mode;
			return $(thisObj.html.control.mode)
				.find('i')
				.removeClass()
				.addClass(playmodes[mode].style)
				.attr('title', playmodes[mode].title)[0];
		},

		switchCurrentTrackStyle: function(trackIndex) {
			thisObj.currentTrackItem()
				.removeClass('xPlayer-current-track');
			$(thisObj.trackList[trackIndex]['html'])
				.addClass('xPlayer-current-track');
		}
	};

	function getDOM(str) {
		return $(thisObj.html.xPlayer).find(str);
	}

	function toHHMMSS(str) {
		sec_numb    = parseInt(str);
		var hours   = Math.floor(sec_numb / 3600);
		var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
		var seconds = sec_numb - (hours * 3600) - (minutes * 60);

		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}

		var time    = (hours?(hours+':'):'') + minutes + ':' + seconds;
		return time;
	}

	function audioEventHandler(e) {
		raiseCallback(callbacks.audio[e.type], e);
		raiseCallback(thisObj.callbacks.audio[e.type], e);
	}

	function raiseCallback(fn,args) {
		if(typeof fn === "function")
			return fn(args);
	}

	// Expose xPlayer to the global object
	window.xPlayer = xPlayer;
})();