# Youtube Timestamps component for Discourse

Converts timestamps within a post, to timestamp hyperlinks to the post's (otherwise the topic's) associated YouTube video.

Uses [extract-timestamp](https://github.com/bevry/extract-timestamp/) for the heavy lifting.

## See it in action here

-   https://discuss.bevry.me/t/maps-of-meaning-9/31/2?u=balupton (has things like `5:1`, `11:1` that are correctly not timestamped)
-   https://discuss.bevry.me/t/maps-of-meaning-8/30/2?u=balupton (has a link to a referenced youtube video inside the notes, hence usage of `# my notes for [associated youtube video](...)` to make sure correct youtube video is associated)
-   https://discuss.bevry.me/t/ep-4-awakening-from-the-meaning-crisis-socrates-and-the-quest-for-wisdom/832/3?u=balupton (standard, associated to topic youtube video)

## Requirements

-   Converted timestamps must be in a post that contains `my notes`
-   Converted timestamps must be in the format of `timestamp -` or `timestamp —`

## Installation

1. Go to https://discuss.bevry.me/admin/customize/themes
1. Click `Install` button on the right
1. Click `From a git repository`
1. Enter `https://github.com/bevry/discourse-component-youtubetimestamps`
1. Click `Install` button inside the modal

<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; 2020+ Benjamin Lupton</li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
