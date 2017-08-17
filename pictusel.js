var H5P = H5P || {};

H5P.Pictusel = (function ($) {
  /**
   * Constructor function.
   */
  function C(options, id) {
    this.$ = $(this);
    var self = this;
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      pictuSlides: [
        {
          'pictuSlide': null
        }
      ],
      "i18n": {
        "left": 'Left',
        "right": 'Right'
      },
      isFixedAspectRatio: false,
      aspectRatio: {
        aspectWidth: 4,
        aspectHeight: 3
      }
    }, options);
    
    // Keep provided id.
    this.id = id;
    this.currentSlideId = 0;
    this.pictuSlides = [];
    this.pictuSlideHolders = [];
    this.aspectRatio = undefined;
    if (this.options.isFixedAspectRatio && this.options.aspectRatio.aspectWidth && this.options.aspectRatio.aspectHeight) {
      this.aspectRatio = this.options.aspectRatio.aspectWidth / this.options.aspectRatio.aspectHeight;
    }
    for (var i = 0; i < this.options.pictuSlides.length; i++) {
      this.pictuSlides[i] = H5P.newRunnable(this.options.pictuSlides[i], this.id, undefined, undefined, {
        aspectRatio: this.aspectRatio
      });
      this.pictuSlides[i].on('loaded', function() {
        self.trigger('resize');
      });
      this.pictuSlideHolders[i] = false;
    }
    
    this.on('enterFullScreen', function() {
      self.enterFullScreen();
    });
    this.on('exitFullScreen', function(){
      self.exitFullScreen();
    });
    this.on('resize', function() {
      var fullScreenOn = self.$container.hasClass('h5p-fullscreen') || self.$container.hasClass('h5p-semi-fullscreen');
      if (fullScreenOn) {
        var newAspectRatio = window.innerWidth / (window.innerHeight - self.$progressBar.outerHeight());
        for (var i = 0; i < self.pictuSlides.length; i++) {
          self.pictuSlides[i].setAspectRatio(newAspectRatio);
        }
      }
      this.updateNavButtons();
      this.updateProgressBar();
    });
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    this.$container = $container;
    // Set class on container to identify it as a greeting card
    // container.  Allows for styling later.
    $container.addClass("h5p-pictusel");
    
    this.$slidesHolder = $('<div>', {
      class: 'h5p-pictusel-slides-holder'
    }).appendTo($container);
    
    this.$slides = $('<div>', {
      class: 'h5p-pictusel-slides'
    }).appendTo(this.$slidesHolder);
    
    this.loadPictuSlides();

    this.$currentSlide = this.pictuSlideHolders[0].addClass('h5p-pictusel-current');
    
    this.attachControls();
  };
  
  C.prototype.enterFullScreen = function() {
    self.$slides.css('height', '');
    this.updateNavButtons();
    this.updateProgressBar();
  };
  
  C.prototype.exitFullScreen = function() {
    if (this.aspectRatio && this.$slides) {
      this.$slides.height(this.$slides.width() / this.aspectRatio);
    }
    
    for (var i = 0; i < this.pictuSlides.length; i++) {
      this.pictuSlides[i].resetAspectRatio();
    }
    this.updateNavButtons();
    this.updateProgressBar();
  };
  
  C.prototype.loadPictuSlides = function() {
    // Load next three pictuSlides (not all for performance reasons)
    for (var i = this.currentSlideId; i < this.pictuSlides.length && i < this.currentSlideId + 3; i++) {
      if (this.pictuSlideHolders[i] === false) {
        this.pictuSlideHolders[i] = $('<div>', {
          'class': 'h5p-pictu-slide-holder'
        });
        if (i > this.currentSlideId) {
          this.pictuSlideHolders[i].addClass('h5p-pictusel-future');
        }
        this.pictuSlides[i].attach(this.pictuSlideHolders[i]);
        this.$slides.append(this.pictuSlideHolders[i]);
      }
    }
  };
  
  C.prototype.attachControls = function() {
    var self = this;
    this.$leftButton = this.createControlButton(this.options.i18n.left, 'left');
    this.$rightButton = this.createControlButton(this.options.i18n.right, 'right');
    this.$leftButton.click(function() {
      if (!self.dragging) {
        self.gotoSlide(self.currentSlideId - 1);
      }
    });
    this.$rightButton.click(function() {
      if (!self.dragging) {
        self.gotoSlide(self.currentSlideId + 1);
      }
    });
    this.$slidesHolder.append(this.$leftButton);
    this.$slidesHolder.append(this.$rightButton);
    this.updateNavButtons();
    this.attachProgressBar();
    this.initDragging();
  };
  
  C.prototype.attachProgressBar = function() {
    this.$progressBar = $('<ul>', {
      class: 'h5p-pictusel-progress'
    });
    for (var i = 0; i < this.pictuSlides.length; i++) {
      this.$progressBar.append(this.createProgressBarElement(i));
    }
    this.$slidesHolder.append(this.$progressBar);
  };
  
  C.prototype.createProgressBarElement = function(index) {
    var self = this;
    var $progressBarElement = $('<li>', {
      class: 'h5p-pictusel-progress-element' 
    }).click(function() {
      self.gotoSlide(index);
    });
    if (index === 0) {
      $progressBarElement.addClass('h5p-pictusel-current-progress-element');
    }
    return $progressBarElement;
  };
  
  C.prototype.createControlButton = function(text, dir) {
    var $controlButton = $('<div>', {
      class: 'h5p-pictusel-button ' + 'h5p-pictusel-' + dir + '-button',
    });
    
    var $controlBg = $('<div>', {
      class: 'h5p-pictusel-button-background'
    });
     $controlButton.append($controlBg);
    
    // TODO: Add real aria label
    var $controlText = $('<div>', {
      class: 'h5p-pictusel-button-text',
      'aria-label': 'text'
    });
    $controlButton.append($controlText);
    
    return $controlButton;
  };
  
  C.prototype.gotoSlide = function(slideId) {
    if (slideId < 0 || slideId >= this.pictuSlideHolders.length) {
      return;
    }
    $('.h5p-pictusel-removing', this.$container).removeClass('.h5p-pictusel-removing');
    var nextSlideDirection = (this.currentSlideId < slideId) ? 'future' : 'past';
    var prevSlideDirection = nextSlideDirection === 'past' ? 'future' : 'past';
    this.currentSlideId = slideId;
    this.loadPictuSlides();
    var $prevSlide = this.$currentSlide;
    var $nextSlide = (this.pictuSlideHolders[slideId]);
    this.prepareNextSlideForAnimation($nextSlide, nextSlideDirection);
    setTimeout(function() {
      $nextSlide.removeClass('h5p-pictusel-no-transition');
      $prevSlide.removeClass('h5p-pictusel-current')
        .addClass('h5p-pictusel-removing')
        .removeClass('h5p-pictusel-' + nextSlideDirection)
        .addClass('h5p-pictusel-' + prevSlideDirection);
      $nextSlide.removeClass('h5p-pictusel-past')
        .removeClass('h5p-pictusel-future')
        .addClass('h5p-pictusel-current');
    }, 1);
   
    this.$currentSlide = $nextSlide;
    this.updateNavButtons();
    this.updateProgressBar();
  };
  
  C.prototype.prepareNextSlideForAnimation = function($nextSlide, direction) {
    $nextSlide.removeClass('h5p-pictusel-past')
      .removeClass('h5p-pictusel-future')
      .addClass('h5p-pictusel-no-transition')
      .addClass('h5p-pictusel-' + direction);
  };
  
  C.prototype.updateNavButtons = function() {
    if (this.currentSlideId >= this.pictuSlides.length - 1) {
      this.$rightButton.hide();
    }
    else {
      this.$rightButton.show();
    }
    if (this.currentSlideId <= 0) {
      this.$leftButton.hide();
    }
    else {
      this.$leftButton.show();
    }
    var heightInPercent = 100;
    var fullScreenOn = this.$container.hasClass('h5p-fullscreen') || this.$container.hasClass('h5p-semi-fullscreen');
    if (!fullScreenOn) {
      var heightInPercent = this.$currentSlide.height() / this.$slides.height() * 100;
    }
    this.$leftButton.css('height', heightInPercent + '%');
    this.$rightButton.css('height', heightInPercent + '%');
  };
  
  C.prototype.updateProgressBar = function () {
    $('.h5p-pictusel-current-progress-element', this.$container).removeClass('h5p-pictusel-current-progress-element');
    $('.h5p-pictusel-progress-element', this.$container).eq(this.currentSlideId).addClass('h5p-pictusel-current-progress-element');
    var heightInPercent = this.$currentSlide.height() / this.$slides.height() * 100;
    $('.h5p-pictusel-progress', this.$container).css('top', heightInPercent + '%');
  };
  
  C.prototype.initDragging = function () {
    var self = this;
    this.$slidesHolder.on('touchstart', function(event) {
      self.dragging = true;
      self.dragStartX = event.originalEvent.touches[0].pageX;
      self.$currentSlide.addClass('h5p-pictusel-dragging');
      if (self.isButton(event.target)) {
        event.preventDefault();
        var d = new Date();
        self.dragStartTime = d.getTime();
      }
    });
    
    this.$slidesHolder.on('touchmove', function(event) {
      event.preventDefault();
      self.dragActionUpdate(event.originalEvent.touches[0].pageX);
    });
    
    this.$slidesHolder.on('touchend', function(event) {
      self.finishDragAction();
      if (self.dragStartTime !== false && self.isButton(event.target)) {
        // This was possibly a click
        var d = new Date();
        if (d.getTime() - self.dragStartTime < 300) {
          if (self.isRightButton(event.target)) {
            self.gotoSlide(self.currentSlideId + 1);
          }
          else {
            self.gotoSlide(self.currentSlideId - 1);
          }
        }
      }
      self.dragStartTime = false;
    });
    
    this.$slidesHolder.on('touchcancel', function(event) {
      self.finishDragAction();
      self.dragStartTime = false;
    });
  };

  C.prototype.isButton = function (domElement) {
    var $target = $(domElement);
    return $target.hasClass('h5p-pictusel-button-background')
      || $target.hasClass('h5p-pictusel-button-text')
      || $target.hasClass('h5p-pictusel-button');
  }

  C.prototype.isRightButton = function (domElement) {
    var $target = $(domElement);
    return $target.hasClass('h5p-pictusel-right-button')
      || $target.parent().hasClass('h5p-pictusel-right-button');
  }
  
  C.prototype.dragActionUpdate = function(x) {
    this.dragXMovement = x - this.dragStartX;
    this.$currentSlide.css('transform', 'translateX(' + this.dragXMovement + 'px)');
    if (this.currentSlideId > 0) {
      var $prevSlide = this.pictuSlideHolders[this.currentSlideId - 1].addClass('h5p-pictusel-dragging');;
      if (this.dragXMovement < 0) {
        $prevSlide.css('transform', 'translateX(-100.001%)');
      }
      else {
        $prevSlide.css('transform', 'translateX(' + (this.dragXMovement - $prevSlide.width()) + 'px)');
      }
    }
    if (this.currentSlideId < this.pictuSlideHolders.length - 1) {
      var $nextSlide = this.pictuSlideHolders[this.currentSlideId + 1].addClass('h5p-pictusel-dragging');
      if (this.dragXMovement > 0) {
        $nextSlide.css('transform', 'translateX(100.001%)');
      }
      else {
        $nextSlide.css('transform', 'translateX(' +(this.dragXMovement + $nextSlide.width()) + 'px)');
      }
    }
    
  };
  
  C.prototype.finishDragAction = function() {
    $('.h5p-pictusel-dragging', this.$container).removeClass('h5p-pictusel-dragging').each(function() {
      this.style.removeProperty('transform');
    });
    this.dragging = false;
    this.dragStartX = undefined;
    var xInPercent = this.dragXMovement / this.$currentSlide.width();
    if (xInPercent < -0.3) {
      if (this.currentSlideId < this.pictuSlideHolders.length - 1) {
        this.gotoSlide(this.currentSlideId + 1);
      }
      else {
        this.$currentSlide.css('transform', 'translateX(0%)');
      }
    }
    else if (xInPercent > 0.3) {
      if (this.currentSlideId > 0) {
        this.gotoSlide(this.currentSlideId - 1);
      }
      else {
        this.$currentSlide.css('transform', 'translateX(0%)');
      }
    }
  };

  return C;
})(H5P.jQuery);
