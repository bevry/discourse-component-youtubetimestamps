import {
	extractYoutubeID,
	replace as replaceTimestamps,
	makeYoutubeTimestamp,
} from "duration-timestamp";

let youtubeID = "";

$.fn.getYoutubeID = function () {
	return extractYoutubeID(this.get(0));
};

$.fn.youtubeTimestamps = function () {
	const $this = $(this);

	if ($this.hasClass("youtube-timestamped")) return $this;
	$this.addClass("youtube-timestamped");

	youtubeID =
		$this.getYoutubeID() || $(document.body).getYoutubeID() || youtubeID;

	if (youtubeID && $this.has('h1:contains("my notes")')) {
		const html = $this.html();
		const result = replaceTimestamps(
			html,
			function (timestamp) {
				return makeYoutubeTimestamp(timestamp, youtubeID, { suffix: " —" });
			},
			{ suffix: " [-—]" }
		);
		if (result && html !== result) $this.html(result);
	}

	return $this;
};

api.decorateCooked(($elem) => $elem.youtubeTimestamps(), {
	id: "youtubetimestamps-decorator",
});
