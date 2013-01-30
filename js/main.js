if (options.gaTracking) {
  var _gaq = [['_setAccount', variables.gaTrackingCode], ['_trackPageview']];
  (function (d, t) {
    var g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];

    g.src = ('https:' == location.protocol ? '//ssl' : '//www') + '.google-analytics.com/ga.js';
    s.parentNode.insertBefore(g, s);
  }(document, 'script'));
}

var isLoading = false,
    countwords = function (text) {
      return text.replace(/\s+/g, ' ').split(' ').length;
    },
    writeWordNumber = function () {
      var info = $('.post-info');

      if (info.length) {

        /**
         * While it would easily be possible to count words in other post types too, to me, it only really makes sense with text posts.
         * Change `info.prev('.text')` to `info.prev('article')` if you want to count all post types.
         */

        var text = info.prev('.text')[0],
          words = 0;

        if (text) {
          words = countwords($(text).find('.body').text());
        }

        if (words) {

          /**
           * Tumblr lacks a localised string for {words}. While I have already tried contacting Tumblr about lacking strings, there is hardly any chance to get them to do something about it.
           * (see: https://groups.google.com/forum/?fromgroups=#!topic/tumblr-themes/btz22uq8ZwE)
           */

          info.find('ul').append('<li class="info-child"><b>Words: </b>' + words + ' words</li>');
        }
      }
    },
    pageNavigation = function (direction) {
      var doc = $(document),
        scrollTop = parseInt(doc.scrollTop()),
        articles = $(document.getElementById('posts')).find('article'),
        articleCount = articles.length,
        i = 0;

      if (1 === direction) {
        for ( ; i < articleCount; i++) {
          var offset = parseInt($(articles[i]).offset().top);

          if (offset >= scrollTop + 20) {
            if (options.animatePageScrolling) {
              $('html, body').animate({scrollTop: 0 < i ? parseInt($(articles[i - 1]).offset().top) - 20 : 0}, 250);
            } else {
              doc.scrollTop(0 < i ? parseInt($(articles[i - 1]).offset().top) - 20 : 0);
            }

            return false;
          }
        }

        if (options.animatePageScrolling) {
          $('html, body').animate({scrollTop: parseInt($(articles[--i]).offset().top) - 20}, 250);
        } else {
          doc.scrollTop(parseInt($(articles[--i]).offset().top) - 20);
        }
      } else if (2 === direction) {
        for ( ; i < articleCount; i++) {
          var offset = parseInt($(articles[i]).offset().top);

          if (offset > scrollTop + 20) {
            if (options.animatePageScrolling) {
              $('html, body').animate({scrollTop: offset - 20}, 250);
            } else {
              doc.scrollTop(offset - 20);
            }

            return false;
          }
        }

        var loadMore = document.getElementById('jsLoadMore');

        if (loadMore) {
          if (options.animatePageScrolling) {
            $('html, body').animate({scrollTop: parseInt($(loadMore).offset().top)}, 250);
          } else {
            doc.scrollTop(parseInt($(loadMore).offset().top));
          }
        }
      }
    },
    loadPosts = function () {
      if (!isLoading) {
        isLoading = true;

        var button = $(document.getElementById('jsLoadMore')),
          href = button.attr('href'),
          page = href.split('/').pop(),
          newHref = href.replace(page, ++page);

        button.text(localisedStrings.loading + '...');

        /**
         * Make an AJAX request for the next page to fetch its posts.
         * This approach is very similar to the one Tumblr is using on their custom mobile theme.
         * The request is based on various steps. First, the next page is fetched and filtered for the posts. Then, the URL is update to not break the browser's back button. Also, the loaded page is tracked in Google Analytics so your stats don't get messed up. Last, the loaded posts are appended and the initiating button changes back to the appropriate state.
         */

        $.ajax({
          url: href,
          success: function (results) {
            var results = $(results),
              posts = results.find('#posts').html(),
              nextLink = results.find('#jsLoadMore').length;

            // If the request was sucessful, append the fetched posts to the post section.
            if ($.trim(posts).length > 0) {
              $(document.getElementById('posts')).append(posts);

              // Update the URL so users don't lose track of what page they're on.
              window.history.pushState(null, null, href);
              if (options.gaTracking) {
                _gaq.push(['_trackPageview', href]);
              }

              // If there's a next page, update the button's URL, otherwise remove it entirely.
              if (nextLink) {
                button.attr('href', newHref).text(localisedStrings.loadMore);
              } else {
                button.remove();
              }
            }

            isLoading = false;
          },
          error: function (request, status, error) {

            // If the request failed, e.g. because of a server timeout, the button's text reflects that and reverts back to its initial state after a certain timeout.
            button.text(error);
            setTimeout(function () {
              button.text(localisedStrings.loadMore);
            }, 3000);
          }
        });
      }
    }

$(function() {
  var loadMore = document.getElementById('jsLoadMore'),
      touch = 'ontouchstart' in document.documentElement;

  if (touch) {
    $(document.body).addClass('touch');

    var swipeStart, vertStart;

    // TODO: Improve vertical scrolling detection

    $('.posts').on('touchstart', 'article', function (e) {
      var e = e.originalEvent;

      if (e.touches.length == 1) {
        var touch = e.touches[0];
        swipeStart = touch.pageX;
        vertStart = touch.pageY;
      }
    });

    $('.posts').on('touchend', 'article', function (e) {
      var e = e.originalEvent,
          touches = e.changedTouches,
          $this = $(this);

      if (touches.length == 1 && touches[0].pageY > vertStart - 15 && touches[0].pageY < vertStart + 15) {
        if (touches[0].pageX - swipeStart < -50 && !$this.hasClass('swiped')) {
          var old = $('.swiped');

          if (old.length) {
            old.removeClass('swiped');
          }

          $this.addClass('swiped');
        } else if (touches[0].pageX - swipeStart > 50) {
          $this.removeClass('swiped');
        }
      } else {
        e.preventDefault();
      }
    });
  } else {
    $(document.body).addClass('no-touch');
  }

  if (options.keyboardNav) {
    $(window).on('keyup', function (e) {
      var code = e.keyCode;

      // l for like
      // r for reblog
      // ... to scroll to top

      if (37 === code || 75 === code) {

        /**
         * pageNavigation(1) scrolls to the previous post or to the very top of the page.
         *
         * 37: left arrow key,
         * 75: k
         */

        pageNavigation(1);
      } else if (39 === code || 74 === code) {

        /**
         * pageNavigation(2) scrolls to the next post or the load-more button, if there is one.
         *
         * 39: right arrow key,
         * 74: j
         */

        pageNavigation(2);
      }
    });
  }

  if (loadMore) {
    $(loadMore).on('click', function (e) {
      e.preventDefault();
      loadPosts();
    });
  }

  writeWordNumber();
});