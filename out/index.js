(function () {
	'use strict';

	/** The regular expression used for finding a timestamp */
	const timestampsRegex = /(?:(?:(?<hours>\d{1,2}):)?(?<minutes>\d{1,2}):(?<seconds>\d{1,2})|(?<bits>(?:\d{1,2}(?:[hms]| ?(?:hour|min(?:ute)?|sec(?:ond)?)s?) ?)+))/;
	/** The regular expression used for extracting a timestmap in 1h2m3s format */
	const timestampRegex = /^(?:(?<hours>\d{1,2})(?:h|\s?hours?)\s?)?(?:(?<minutes>\d{1,2})(?:m|\s?min(?:ute)?s?)\s?)?(?:(?<seconds>\d{1,2})(?:s|\s?sec(?:ond)?s?)\s?)?$/;
	const secondsInMinute = 60;
	const minutesInHour = 60;
	const secondsInHour = secondsInMinute * minutesInHour;
	/**
	 * Checks whether any of the timestamp's `hours`, `minutes`, and `seconds` has a value >= 0.
	 * @returns `true` if there was a value, otherwise `false`.
	 */
	function verifyTimestamp(timestamp) {
		if (timestamp == null) return false
		const { hours, minutes, seconds } = timestamp;
		if (hours == null && minutes == null && seconds == null) return false
		return true
	}
	/** The timestamp stringify formats available to us */
	var Format
	;(function (Format) {
		Format['Numeric'] = '00:00:00';
		Format['Seconds'] = '0s';
		Format['Tiny'] = '0h0m0s';
		Format['Short'] = '0h 0m 0s';
		Format['Medium'] = '0 hours 0 mins 0 secs';
		Format['Long'] = '0 hours 0 minutes 0 seconds';
	})(Format || (Format = {}));
	/** Pad a value for output in 00:00:00 format */
	function pad(value) {
		if (!value) return '00'
		if (value < 10) return '0' + String(value)
		return String(value)
	}
	/**
	 * Turn a timestamp object into a string.
	 * @returns `null` if invalid, `00s` if empty, otherwise the timestamp in `Hh Mm Ss` format
	 */
	function stringifyTimestamp(timestamp, format = Format.Short) {
		if (verifyTimestamp(timestamp) === false) return null
		const { total, hours, minutes, seconds } = timestamp;
		const parts = [];
		switch (format) {
			case Format.Short:
				if (Number(hours)) parts.push(`${hours}h`);
				if (Number(minutes)) parts.push(`${minutes}m`);
				if (Number(seconds)) parts.push(`${seconds}s`);
				return parts.join(' ') || '00s'
			case Format.Tiny:
				if (Number(hours)) parts.push(`${hours}h`);
				if (Number(minutes)) parts.push(`${minutes}m`);
				if (Number(seconds)) parts.push(`${seconds}s`);
				return parts.join('') || '0s'
			case Format.Medium:
				if (Number(hours)) parts.push(`${hours} hours`);
				if (Number(minutes)) parts.push(`${minutes} mins`);
				if (Number(seconds)) parts.push(`${seconds} secs`);
				return parts.join(' ') || '0 secs'
			case Format.Long:
				if (Number(hours)) parts.push(`${hours} hours`);
				if (Number(minutes)) parts.push(`${minutes} minutes`);
				if (Number(seconds)) parts.push(`${seconds} seconds`);
				return parts.join(' ') || '0 seconds'
			case Format.Numeric:
				if (Number(hours)) {
					parts.push(hours, pad(minutes), pad(seconds));
				} else {
					parts.push(minutes || '0', pad(seconds));
				}
				return parts.join(':')
			case Format.Seconds:
				return String(total) + 's'
			default:
				throw new Error('stringifyTimestamp: invalid format')
		}
	}
	/**
	 * Make a timestamp object from hours, minutes, and seconds.
	 * Will return an empty object, if the timestamp
	 */
	function makeTimestamp(hours, minutes, seconds) {
		if (verifyTimestamp({ hours, minutes, seconds }) === false) return null
		const timestamp = { total: 0 };
		if (hours != null) {
			timestamp.hours = Number(hours);
			timestamp.total += timestamp.hours * secondsInHour;
		}
		if (minutes != null) {
			timestamp.minutes = Number(minutes);
			timestamp.total += timestamp.minutes * secondsInMinute;
		}
		if (seconds != null) {
			timestamp.seconds = Number(seconds);
			timestamp.total += timestamp.seconds;
		}
		return timestamp
	}
	function extractTimestampFromGroup(groups) {
		if (!groups) return null
		// 1h2m3s format
		if (groups.bits) {
			const bitsMatch = groups.bits.match(timestampRegex);
			if (!bitsMatch || !bitsMatch.groups) return null
			return makeTimestamp(
				bitsMatch.groups.hours,
				bitsMatch.groups.minutes,
				bitsMatch.groups.seconds
			)
		}
		// 00:00:00 format
		return makeTimestamp(groups.hours, groups.minutes, groups.seconds)
	}
	/**
	 * Replace timestamp occurences within a string with the results of a replacer function
	 * @example
	 * ``` javascript
	 * import {replaceTimestamps, youtubeTimestamp} from 'extract-timestamp'
	 * const result = replaceTimestamps(html, function(timestamp) {
	 * 	return youtubeTimestamp(timestamp, youtubeID, ' —')
	 * }, ' [-—]')
	 * ```
	 * @param input The string to replace the timestmaps within
	 * @param replacer A method that takes in the timestamp object and should return a string to replace the timestamp text with
	 * @param suffix An optional suffix to append to the regular expression for limiting what the timestamp regex can match (e.g. use ` [-—]` to only match timestamps suffixed by ` -` or ` —`)
	 */
	function replaceTimestamps(input, replacer, suffix = '') {
		const regex = new RegExp(timestampsRegex.source + suffix, 'g');
		return input.replace(regex, function (match, ...args) {
			const timestamp = extractTimestampFromGroup(args[args.length - 1]);
			// check we have what we need
			const text = replacer(timestamp);
			if (text) {
				console.log('replaced:', text);
				return text
			}
			// fallback
			console.log('fallback:', match);
			return match
		})
	}
	/** Make a HTML link for a youtube video to commence at a timestamp */
	function makeYoutubeTimestamp(
		timestamp,
		youtubeID,
		suffix = '',
		format
	) {
		const text = stringifyTimestamp(timestamp, format);
		if (text) {
			const url = `https://www.youtube.com/watch?v=${youtubeID}&t=${stringifyTimestamp(
			timestamp,
			Format.Tiny
		)}`;
			return `<a href="${url}" title="View the video ${youtubeID} at ${text}">${text}</a>${suffix}`
		}
		return text
	}
	/** Extract the first youtube video identifier that is found within an element */
	function extractYoutubeID(el) {
		// prepare
		let youtubeID, child;
		// href is first
		// as https://discuss.bevry.me/t/maps-of-meaning-9/31 links to the topic video
		// but embeds the discussion video
		child = el.querySelector('[href^="https://www.youtube.com/watch?v="]');
		const href = child && child.getAttribute('href');
		if (href) {
			const url = new URL(href);
			youtubeID = url.searchParams.get('v');
			if (youtubeID) return youtubeID
		}
		// player
		child = el.querySelector('[data-youtube-id]');
		youtubeID = child && child.getAttribute('data-youtube-id');
		if (youtubeID) return youtubeID
		// embed
		child = el.querySelector('[src^="https://www.youtube.com/embed/"]');
		const src = child && child.getAttribute('src');
		if (src) {
			const url = new URL(src);
			youtubeID = url.pathname.substring(7);
			if (youtubeID) return youtubeID
		}
		// debug
		// console.log('this:', $this.html())
		return ''
	}

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
	        return makeYoutubeTimestamp(timestamp, youtubeID, " —");
	      },
	      " [-—]"
	    );
	    if (result && html !== result) $this.html(result);
	  }

	  return $this;
	};

	api.decorateCooked(($elem) => $elem.youtubeTimestamps(), {
	  id: "youtubetimestamps-decorator",
	});

}());
