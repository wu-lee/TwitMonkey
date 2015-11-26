/** Grab tweets and post to an URL of your choice.


// ==UserScript==
// @name          	TwitMonkey
//// @namespace     	https://openuserjs.org/users/wu-lee
// @description   	Scrapes tweets and posts them to a collection point.
// @version       	0.1
// @run-at        	document-end
// @include       	http*://twitter.com/*
// @include       	http*://www.twitter.com/*
// @exclude		  	about:blank
// @require       	https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/json2/20150503/json2.min.js
// @grant         	GM_xmlhttpRequest
// ==/UserScript==
 */

var sink = 'http://localhost:5984/twitsink/';
console.log("TwitMonkey:- " + location.href + " -> " +sink);
//this.$ = this.jQuery = jQuery.noConflict(true


//console.log("button", $('#twitmonkey-button-id')

/** The TwitMonkey constructor */
function TwitMonkey(url) {
    this.url = url;
}

/** Posts a single tweet to the sink url
 */
TwitMonkey.prototype.post = function(elem) {
    var node = $(elem);
    var html = node.find('.original-tweet').first(); // FIXME currently ignores subsequent elems
    var tweetId = html.attr('data-retweet-id') || html.attr('data-tweet-id');
    var tweet = {
        type: 'tweet',
        html: html[0].outerHTML,
    };
    var url = this.url + tweetId;
    // Cross-post the data
	GM_xmlhttpRequest({
		"method": "PUT",
		"url": url,
		"data": JSON.stringify(tweet),
		"headers": {  
			'Content-Type': 'application/javascript;',
//			'Authorization': auth, // FIXME
//			'Client-Type': 'Browser',
//			'Client-Version': '0.1',
		},
		"onload": function(data){
			var r = data.responseText;
			//var json = JSON.parse(r);
            
			console.log("posted "+url+", response: ", r);
		},
        onerror: function(err) {
	        console.log("posted "+url+", error: ", err);
        },
	});
};

/** Posts the whole twitter stream to the sink url
 */
TwitMonkey.prototype.scrape = function() {
    console.log("starting");
    var self = this;
    $('#stream-items-id').children().each(function(ix, it) {
        self.post(it);
    })
};
/** Creates an event handler
 *
 * The handler needs to remember the object it was created from.
 */
TwitMonkey.prototype.scrapeHandler = function() {
    var self = this;
    return function() { return self.scrape(); };
};

$('.nav.right-actions').append('<li class="topbar-tweet-btn"><button id="twitmonkey-button-id" class="btn tweet-btn" type="button"><span class="Icon Icon--download"></span><span class="text">TwitMonkey</span></button></li>');
$('#twitmonkey-button-id').on('click', new TwitMonkey(sink).scrapeHandler())

