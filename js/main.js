$(document).ready(function() {
	var myPlayer = new xPlayer({
		options: {
			target: '#xPlayer',
			thumbnailbg: 'img/empty_thumbnail.jpg',
			autoplay: true
		}
	});
	myPlayer.loadJSON('songs.json');
});