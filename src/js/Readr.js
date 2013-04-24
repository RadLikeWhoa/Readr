Readr = (function () {

  function Readr () { }

  Readr.init = function () {
    Readr.Utilities.writeWordNumber();
    Readr.Utilities.bindUIActions();
    Readr.Utilities.analytics();
    Readr.Touch.detectTouch();
    Readr.Twitter.init();
  }

  return Readr;

}())