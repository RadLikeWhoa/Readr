Readr.Page = (function () {

  function Page () { }

  var $doc = $(document),
      KEYBOARD_NAVIGATION_PADDING = 20,
      SMOOTH_SCROLLING_SPEED = 250,
      isLoading = false,
      loadMore = document.getElementById('jsLoadMore');

  Page.scrollTo = function (point) {
    /**
     * Scrolling through posts using keyboard navigation (j/k) can either
     * be animated or jumping. This is set through the Customisation screen
     * and checked via the global options object.
     */

    if (options.smoothScrollingKeyboardNavigation) {
      $('html, body').animate({scrollTop: point}, SMOOTH_SCROLLING_SPEED);
    } else {
      $doc.scrollTop(point);
    }
  }

  Page.loadPosts = function () {
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

        if (posts.length) {
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
  }

  Page.pageNavigation = function (direction) {
    var scrollTop = $doc.scrollTop(),
        articles = $(document.getElementById('posts')).find('article'),
        offset = 0;

    if (direction === 'next') {

      /**
       * Loop through the posts. As soon as a post is discovered having an
       * top-offset that's larger than the current vertical scroll position,
       * scroll to that article.
       */

      for (var i = 0, j = articles.length ; i < j; i++) {
        offset = parseInt($(articles[i]).offset().top - KEYBOARD_NAVIGATION_PADDING, 10);

        if (offset > scrollTop) {
          Page.scrollTo(offset);

          /**
           * If a visitor navigates to the penultimate post, load more posts
           * and scroll down.
           */

          if (i >= j - 2 && loadMore) Page.loadPosts();

          return;
        }
      }
    } else if (direction === 'prev') {

      /**
       * Loop through the posts. As soon as a post is discovered having an
       * offset that is higher than the current scroll position, scroll to
       * the post before it.
       */

      for (var k = 0, l = articles.length ; k < l; k++) {
        offset = parseInt($(articles[k]).offset().top - KEYBOARD_NAVIGATION_PADDING, 10);

        if (offset >= scrollTop) {
          Page.scrollTo(0 < k ? $(articles[k - 1]).offset().top - KEYBOARD_NAVIGATION_PADDING : 0);
          return;
        }
      }

      /**
       * If no posts matching the criteria are found, scroll to the
       * penultimate post.
       */

      Page.scrollTo($(articles[--k]).offset().top - KEYBOARD_NAVIGATION_PADDING);
    }
  }

  return Page;

}())