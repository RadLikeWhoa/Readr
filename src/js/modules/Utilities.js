Readr.Utilities = (function () {

  function Utilities () { }

  var Page = Readr.Page,
      loadMore = document.getElementById('jsLoadMore');

  Utilities.writeWordNumber = function () {
    var info = $('.post-info');

    if (!info.length) return;

    /**
     * While it would easily be possible to count words in other post types
     * too, to me, it only really makes sense with text posts.
     */

    var text = info.parent().prev('.text')[0],
        words = text ? Utilities.countwords($(text).find('.body').text()) : 0;

    /**
     * Tumblr lacks a localised string for {words}. While I have already
     * tried contacting Tumblr about lacking strings, there is hardly any
     * chance to get them to do something about it.
     *
     * (see: http://cl.ly/Mar0)
     */

    if (words) info.append('<li class="info-child"><b>Words: </b>' + words + ' words</li>');
  }

  Utilities.countwords = function (text) {
    /**
     * This is a simple function to count words on a given string of text.
     * It is taken from helpers.js (https://github.com/RadLikeWhoa/helpers.js).
     */

    return text.replace(/\s+/g, ' ').split(' ').length;
  }

  Utilities.bindUIActions = function () {
    /**
     * If keyboard navigation is enabled on the Customisation screen, bind
     * the necessary events to the window.
     */

    if (options.keyboardNav) {
      $(window).on('keyup', function (e) {
        var code = e.keyCode;

        /**
         * j (74) and arrow right (39) navigate to the next post, k (75) and
         * arrow left (37) navigate to the previous post.
         */

        if (74 === code || 39 === code) {
          Page.pageNavigation('next');
        } else if (75 === code || 37 === code) {
          Page.pageNavigation('prev');
        } else if (190 === code) {
          Page.scrollTo(0);
        }
      });
    }

    $(window).on('resize', function () {
      if (Page.postPositions.length) Page.notePostPositions();
    });

    /**
     * If there is a next page and inline post loading is enabled, bind the
     * requesting action to the button.
     */

    if (loadMore) {
      $(loadMore).on('click', function (e) {
        e.preventDefault();
        Page.loadPosts();
      });
    }
  }

  return Utilities;

}())