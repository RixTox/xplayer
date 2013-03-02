$(document).ready(function() {
	var myPlayer = new xPlayer({
		options: {
			target: '#xPlayer',
			json: 'songs.json',
			thumbnailbg: 'img/empty_thumbnail.jpg',
			autoplay: true
		}
	});
});