Readr.Touch = (function () {

  function Touch () { }

  var SWIPE_THRESHOLD = 50,
      SWIPE_VERTICAL_THRESHOLD = 15,
      SWIPE_CLASS = 'swiped',
      touch = 'ontouchstart' in document.documentElement;

  Touch.detectTouch = function () {
    if (touch) {
      Touch.bindTouchActions();
    } else {
      document.body.classList.add('no-touch');
    }
  }

  Touch.bindTouchActions = function () {
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
  }

  return Touch;

}())