Readr = (function () {

  function Readr () {
    this.Page = new Readr.Page();
    this.Utilities = new Readr.Utilities();
    this.Touch = new Readr.Touch();
    this.Twitter = new Readr.Twitter();
  }

  Readr.init = function () {
    Readr.Utilities.writeWordNumber();
    Readr.Utilities.bindUIActions();
    Readr.Utilities.analytics();
    Readr.Touch.detectTouch();
    Readr.Twitter.init();
  }

  return Readr;

}())