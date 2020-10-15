/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ImageSlider'] = (function () {
  return {
    1: {

      /*
       * Move images
       */
      2: function (parameters, finished, extras) {
        parameters.imageSlides = parameters.imageSlides || [];
        parameters.imageSlides.forEach(function (oldSlide) {

          // Create duplicate
          const imageSlide = {};
          if (oldSlide.library) {
            imageSlide.library = oldSlide.library;
          }
          if (oldSlide.metadata) {
            imageSlide.metadata = oldSlide.metadata;
          }
          if (oldSlide.params) {
            imageSlide.params = oldSlide.params;
          }
          if (oldSlide.subContentId) {
            imageSlide.subContentId = oldSlide.subContentId;
          }
          oldSlide.imageSlide = imageSlide;

          // Remove original data
          delete oldSlide.library;
          delete oldSlide.metadata;
          delete oldSlide.params;
          delete oldSlide.subContentId;
        });

        finished(null, parameters, extras);
      }
    }
  };
})();
