/*global jQuery */
/*!
* FitVids 1.0
*
* Copyright 2011, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
* Date: Thu Sept 01 18:00:00 2011 -0500
*/

(function( $ ){

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null
    }

    var div = document.createElement('div'),
        ref = document.getElementsByTagName('base')[0] || document.getElementsByTagName('script')[0];

  	div.className = 'fit-vids-style';
    div.innerHTML = '&shy;<style>         \
      .fluid-width-video-wrapper {        \
         width: 100%;                     \
         position: relative;              \
         padding: 0;                      \
      }                                   \
                                          \
      .fluid-width-video-wrapper iframe,  \
      .fluid-width-video-wrapper object,  \
      .fluid-width-video-wrapper embed {  \
         position: absolute;              \
         top: 0;                          \
         left: 0;                         \
         width: 100%;                     \
         height: 100%;                    \
      }                                   \
    </style>';

    ref.parentNode.insertBefore(div,ref);

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src^='http://player.vimeo.com']",
        "iframe[src^='http://www.youtube.com']",
        "iframe[src^='https://www.youtube.com']",
        "iframe[src^='http://www.kickstarter.com']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = $(this).find(selectors.join(','));

      $allVideos.each(function(){
        var $this = $(this);
        if (this.tagName.toLowerCase() == 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        var height = this.tagName.toLowerCase() == 'object' ? $this.attr('height') : $this.height(),
            aspectRatio = height / $this.width();
		if(!$this.attr('id')){
			var videoID = 'fitvid' + Math.floor(Math.random()*999999);
			$this.attr('id', videoID);
		}
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $this.removeAttr('height').removeAttr('width');
      });
    });

  }
})( jQuery );


/**
 * Tumblindex
 * original: April 19, 2012
 */

var ct = new Date();
if (document.location.hostname != 'www.tumblr.com') {
	document.write("<script src='http://"+document.location.hostname+"/api/read/json?num=50?"+ct.getTime()+"'></script>");
}

$(document).ready(function(){

	//get root and current URL
	var loc = document.URL;
  var root = document.location.hostname;
  var path = window.location.pathname;
	var dir = path.substring(path.lastIndexOf('/'));

	//read in posts from tumblr
	if (root != 'www.tumblr.com') {
		var posts = tumblr_api_read.posts;
		for (var i in posts) {
			$('#project-list').append('<li><a href='+posts[i].url+'>'+posts[i].tags[0]+'</a></li>');
		}
	} else {
		$('#project-list').append('<li><a href="#">project title</a></li>')
	}

	//determine whether we are on homepage and should remove posts
	if (loc == 'http://'+root+'/' || root == 'www.tumblr.com'){
		$('#posts').remove();
	} else {
		$('#posts').show();
		$('#description').remove();
	}

	//determine if there is a description on homepage and remove img margin
	if ($('#desc').text().length <= 0){
		$('#description img').css('margin-top','0px');
	}

	//video fixing madness
	$('.video').fitVids();

	//current page
	$('#project-list a,#pages a').each(function(){
		if( $(this).attr('href') == loc || $(this).attr('href') == dir ){
			$(this).parent('li').addClass('activelink');
		}
	});

});
