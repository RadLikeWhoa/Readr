Readr.Twitter = (function () {

  function Twitter () { }

  var intentRegex = /twitter\.com(\:\d{2,4})?\/intent\/(\w+)/,
      windowOptions = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes',
      width = 550,
      height = 420,
      winHeight = screen.height,
      winWidth = screen.width;

  var handleIntent = function (e) {
    e = e || window.event;
    var target = e.target || e.srcElement,
        m, left, top;

    while (target && target.nodeName.toLowerCase() !== 'a') {
      target = target.parentNode;
    }

    if (target && target.nodeName.toLowerCase() === 'a' && target.href) {
      m = target.href.match(intentRegex);
      if (m) {
        left = Math.round((winWidth / 2) - (width / 2));
        top = 0;

        if (winHeight > height) {
          top = Math.round((winHeight / 2) - (height / 2));
        }

        window.open(target.href, 'intent', windowOptions + ',width=' + width +
                                           ',height=' + height + ',left=' + left + ',top=' + top);
        e.returnValue = false;
        e.preventDefault && e.preventDefault();
      }
    }
  }

  var escapeHTML = function (str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  Twitter.parseTweet = function (tweet) {
    if (!(tweet.entities)) return escapeHTML(tweet.text);

    var indexMap = {};

    $.each(tweet.entities.urls, function(i, entity) {
      indexMap[entity.indices[0]] = [entity.indices[1], function (text) {
        return '<a href="' + escapeHTML(entity.url) + '" {Target}>' + escapeHTML(text) + '</a>';
      }];
    });

    $.each(tweet.entities.hashtags, function(i, entity) {
      indexMap[entity.indices[0]] = [entity.indices[1], function (text) {
        return '<a href="https://twitter.com/search?q=' + escape('#' + entity.text) + '" {Target}>' + escapeHTML(text) + '</a>';
      }];
    });

    $.each(tweet.entities.user_mentions, function(i, entity) {
      indexMap[entity.indices[0]] = [entity.indices[1], function (text) {
        return '<a href="https://twitter.com/' + escapeHTML(entity.screen_name) + '" title="' + escapeHTML(entity.name) + '" {Target}>' + escapeHTML(text) + '</a>';
      }];
    });

    var result = "",
        last_o = 0,
        o;

    for (o = 0, p = tweet.text.length; o < p; ++o) {
      var index = indexMap[o];
      if (!index) continue;

      var end = index[0],
          func = index[1];

      if (o > last_o) result += escapeHTML(tweet.text.substring(last_o, o));
      result += func(tweet.text.substring(o, end));
      o = end - 1;
      last_o = end;
    }

    if (o > last_o) result += escapeHTML(tweet.text.substring(last_o, o));

    return result;
  }

  Twitter.getTimestamp = function (time_value) {
    var values = time_value.split(' ');

    time_value = values[1] + ' ' + values[2] + ', ' + values[5] + ' ' + values[3];

    var parsed_date = Date.parse(time_value),
        relative_to = (arguments.length > 1) ? arguments[1] : new Date(),
        delta = parseInt((relative_to.getTime() - parsed_date) / 1000, 10);

    delta = delta + (relative_to.getTimezoneOffset() * 60);

    if (delta < 120) {
      return 'a minute ago';
    } else if (delta < 45 * 60) {
      return parseInt(delta / 60, 10) + ' minutes ago';
    } else if (delta < 90 * 60) {
      return 'an hour ago';
    } else if (delta < 24 * 60 * 60) {
      return Math.ceil(parseInt(delta / 3600, 10)) + ' hours ago';
    } else if (delta < 48 * 60 * 60) {
      return '1 day ago';
    } else {
      return parseInt(delta / 86400, 10) + ' days ago';
    }
  }

  Twitter.init = function () {
    if (window.__twitterIntentHandler) return;

    if (document.addEventListener) {
      document.addEventListener('click', handleIntent, false);
    } else if (document.attachEvent) {
      document.attachEvent('onclick', handleIntent);
    }

    window.__twitterIntentHandler = true;
  }

  return Twitter;

}())