$(document).ready(function() {
	myPlayer = new xPlayer({
		options: {
			target: '#xPlayer',
			json: 'songs.json',
			thumbnailbg: 'img/empty_thumbnail.jpg',
			autoplay: true
		}
	});
	$(window).on('keypress', function(e) {
		switch(e.keyCode) {
			case 32: // space
				e.preventDefault();
				myPlayer.audio.paused
					? myPlayer.play()
					: myPlayer.pause();
				break;
			case 110: // 'n'
				e.preventDefault();
				myPlayer.next();
				break;
			case 112: // 'p'
				e.preventDefault();
				myPlayer.previous();
				break;
			case 109: // 'm'
				e.preventDefault();
				myPlayer.nextPlayMode();
				break;
			case 113: // 'q'
				e.preventDefault();
				myPlayer.stop();
		}
	});
});