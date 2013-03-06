// TODO: CHECK

if (options.gaTracking) {
  var _gaq = [['_setAccount', variables.gaTrackingCode], ['_trackPageview']];
  (function (d, t) {
    var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];

    g.src = ('https:' === location.protocol ? '//ssl' : '//www') + '.google-analytics.com/ga.js';
    s.parentNode.insertBefore(g, s);
  }(document, 'script'));
}

var Readr = (function () {

  var self,
      SWIPE_THRESHOLD = 50,
      SWIPE_VERTICAL_THRESHOLD = 15,
      SWIPE_CLASS = 'swiped',
      KEYBOARD_NAVIGATION_PADDING = 20,
      SMOOTH_SCROLLING_SPEED = 250,
      touch = 'ontouchstart' in document.documentElement,
      isLoading = false,
      doc = $(document),
      loadMore = document.getElementById('jsLoadMore'),
      scrollTo = function (point) {

        /**
         * Scrolling through posts using keyboard navigation (j/k) can either
         * be animated or jumping. This is set through the Customisation screen
         * and checked via the global options object.
         */

        if (options.animatePageScrolling) {
            $('html, body').animate({scrollTop: point}, SMOOTH_SCROLLING_SPEED);
          } else {
            doc.scrollTop(point);
          }
      };

  return {

    writeWordNumber: function () {
      var info = $('.post-info');

      if (info.length) {

        /**
         * While it would easily be possible to count words in other post types
         * too, to me, it only really makes sense with text posts.
         *
         * Change `info.parent().prev('.text')` to
         * `info.parent().prev('article')` if you want to count all post types.
         */

        var text = info.parent().prev('.text')[0],
            words = text ? self.countwords($(text).find('.body').text()) : 0;

        /**
         * Tumblr lacks a localised string for {words}. While I have already
         * tried contacting Tumblr about lacking strings, there is hardly any
         * chance to get them to do something about it.
         *
         * (see: http://cl.ly/Mar0)
         */

        if (words) {
          info.append('<li class="info-child"><b>Words: </b>' + words + ' words</li>');
        }
      }
    },

    countwords: function (text) {

      /**
       * This is a simple function to count words on a given string of text.
       * It is taken from helpers.js (https://github.com/RadLikeWhoa/helpers.js).
       */

      return text.replace(/\s+/g, ' ').split(' ').length;
    },

    loadPosts: function () {

      /**
       * In order to prevent the user from firing multiple request at once,
       * check the isLoading variable if there is a request going on at the
       * moment.
       */

      if (isLoading) return;
      isLoading = true;

      var href = loadMore.href,
          page = href.split('/').pop();

      loadMore.textContent = localisedStrings.loading + '...';

      /**
       * Make an AJAX request for the next page (based on the URL of
       * loadMore) to fetch its posts.
       *
       * This approach is very similar to the one Tumblr is using on their
       * custom mobile theme.
       */

      $.ajax({
        url: href,
        success: function (results) {
          results = $(results);

          var posts = results.find('#posts').html().trim();

          /**
           * If the request returned posts they are appended to the list of
           * existing posts.
           *
           * Unless the request fails because of an actual error (which is
           * handled through the error callback) there should be at least one
           * post, otherwise the request should not have been possible.
           */

          if (posts.length > 0) {
            $(document.getElementById('posts')).append(posts);

            /**
             * In modern browsers the window's location is updated to reflect
             * the fetched page. This is to not break the behaviour of the back
             * button and the browser history.
             */

            window.history.pushState(null, null, href);

            /**
             * As a global Google Analytics object exists, inline requests can be
             * pushed so those views don't get lost.
             */

            // TODO: CHECK

            if (options.gaTracking) _gaq.push(['_trackPageview', href]);

            /**
             * If the request returned a page that contains a new loadMore button,
             * update the button's URL to reflect the next page. If not, remove the
             * button so users can't load an inexisting page.
             */

            if (results.find('#jsLoadMore').length) {
              loadMore.href = href.replace(page, ~~page + 1);
              loadMore.textContent = localisedStrings.loadMore;
            } else {
              loadMore.parentNode.removeChild(loadMore);
            }
          }

          isLoading = false;
        },
        error: function (request, status, error) {

          /**
           * Situations where the AJAX request fails are handled here.
           * The button's text is updated to reflect the returned error
           * and reset 3 seconds later. During this period, no additional
           * request is possible.
           */

          loadMore.textContent = error;

          setTimeout(function () {
            loadMore.textContent = localisedStrings.loadMore;
            isLoading = false;
          }, 3000);
        }
      });
    },

    pageNavigation: function (direction) {
      var scrollTop = doc.scrollTop(),
          articles = $(document.getElementById('posts')).find('article'),
          offset = 0;

      if (direction === 'next') {

        /**
         * Loop through the posts. As soon as a post is discovered having an
         * top-offset that's larger than the current vertical scroll position,
         * scroll to that article.
         */

        for (var i = 0, j = articles.length ; i < j; i++) {
          offset = $(articles[i]).offset().top - KEYBOARD_NAVIGATION_PADDING;

          if (offset > scrollTop) {
            scrollTo(offset);
            return;
          }
        }

        /**
         * If a visitor tries to navigate down from the last post, load more
         * posts and scroll to where they will appear.
         */

        if (loadMore) {
          scrollTo($(loadMore).offset().top - KEYBOARD_NAVIGATION_PADDING);
          self.loadPosts();
        }
      } else if (direction === 'prev') {

        /**
         * Loop through the posts. As soon as a post is discovered having an
         * offset that is higher than the current scroll position, scroll to
         * the post before it.
         */

        for (var i = 0, j = articles.length ; i < j; i++) {
          offset = $(articles[i]).offset().top - KEYBOARD_NAVIGATION_PADDING;

          if (offset >= scrollTop) {
            scrollTo(0 < i ? $(articles[i - 1]).offset().top - KEYBOARD_NAVIGATION_PADDING : 0);
            return;
          }
        }

        /**
         * If no posts matching the criteria are found, scroll to the
         * penultimate post.
         */

        scrollTo($(articles[--i]).offset().top - KEYBOARD_NAVIGATION_PADDING);
      }
    },

    bindUIActions: function () {

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

          if (39 === code || 74 === code) {
            self.pageNavigation('next');
          } else if (37 === code || 75 === code) {
            self.pageNavigation('prev');
          }
        });
      }

      /**
       * If there is a next page and inline post loading is enabled, bind the
       * requesting action to the button.
       */

      if (loadMore) {
        $(loadMore).on('click', function (e) {
          e.preventDefault();
          self.loadPosts();
        });
      }
    },

    detectTouch: function () {
      if (!touch) {
        document.body.classList.add('no-touch');
      } else {
        self.bindTouchActions();
      }
    },

    bindTouchActions: function () {
      var swipeStart, vertStart;

      /**
       * As soon as a post is touched, the coordinates get logged to later
       * calculate the gesture.
       *
       * swipeStart is used for the horizontal offset, while vertStart is
       * used to detect simple scrolling.
       */

      $('.posts').on('touchstart', 'article', function (e) {
        e = e.originalEvent;

        if (e.touches.length === 1) {
          var touch = e.touches[0];
          swipeStart = touch.pageX;
          vertStart = touch.pageY;
        }
      });

      /**
       * Once the finger is released from a post, check if the gesture is a
       * swipe. If it is, trigger the meta revealing animation.
       */

      $('.posts').on('touchend', 'article', function (e) {

        /**
         * e.originalEvent is required because jQuery behaves weirdly with
         * touch events and doesn't send the correct event.
         */

        e = e.originalEvent;

        var touches = e.changedTouches,
            $this = $(this);

        /**
         * Check if the swipe was indeed a swipe and not basic scrolling.
         */

        if (touches.length === 1 && touches[0].pageY > vertStart - SWIPE_VERTICAL_THRESHOLD && touches[0].pageY < vertStart + SWIPE_VERTICAL_THRESHOLD) {
          if (touches[0].pageX - swipeStart < -SWIPE_THRESHOLD && !$this.hasClass(SWIPE_CLASS)) {

            /**
             * If the swipe was to the left and over the swipe distance
             * threshold, reveal the swiped post's meta and move the
             * previously swiped post back to its initial position.
             */

            var old = $('.' + SWIPE_CLASS);
            if (old.length) old.removeClass(SWIPE_CLASS);
            $this.addClass(SWIPE_CLASS);
          } else if (touches[0].pageX - swipeStart > SWIPE_THRESHOLD) {

            /**
             * If the swipe was to the right and over the swipe distance
             * threshold, move the post back to its initial position.
             */

            $this.removeClass(SWIPE_CLASS);
          }
        } else {

          /**
           * Don't do anything if the user has scrolled through the list of
           * posts.
           */

          e.preventDefault();
        }
      });
    },

    init: function () {
      self = this;

      /**
       * Call the functions required to enable all functionality at launch.
       * Mainly, this means binding events to elements. If the visitor uses
       * a touch screen devices, special touch events are attached as well.
       */

      self.writeWordNumber();
      self.bindUIActions();
      self.detectTouch();
    }

  };

}());

Readr.init();