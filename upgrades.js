var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ImageSlider'] = (function () {
  return {
    1: {
      /**
       * Asynchronous content upgrade hook.
       *
       * Move aspect settings to behavioural settings group
       *
       * @param {Object} parameters
       * @param {function} finished
       */
      1: function (parameters, finished, extras) {
        // Copy aspect settings to behaviour group and set new defaults
        parameters.behaviour = {
          aspectRatioMode: parameters.aspectRatioMode,
          aspectRatio: parameters.aspectRatio,
          loop: false,
          autoProgress: false,
          progressionTime: 5,
          hideNavigation: false
        }

        // Delete old aspect settings
        delete parameters.aspectRatioMode;
        delete parameters.aspectRatio;

        finished(null, parameters, extras);
      }
    }
  };
})();
