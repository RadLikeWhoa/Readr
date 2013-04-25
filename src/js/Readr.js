Readr = (function () {

  function Readr () { }

  Readr.init = function () {
    Readr.Utilities.writeWordNumber();
    Readr.Utilities.bindUIActions();
    Readr.Touch.detectTouch();
  }

  return Readr;

}())