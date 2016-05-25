(function ($) {
  'use strict';

  /**
   * @description
   * 图片路径加载
   *
   * @example
   *
   * # html
   * ```
   * 
   * <div class="js-image-container">
   *   <div class="image-item">
   *      <img  class="js-image" src="" data-src="demoSrc">
   *   </div>
   *   <div class="image-item">
   *      <img  class="js-image" src="" data-src="demoSrc">
   *   </div>
   * </div>

   * <div class="js-prev"></div>
   * <div class="js-next"></div>
   *```
   * # javascript 调用
   * ```
   * $('.js-image-container').imageLoading({
   *   showItem: 4, // 一次最多显示几个
   *   imageContainer: '.js-image-container',
   *   image: '.js-image',
   *   prev: '.js-prev',
   *   next: '.js-next',
   * });
   * ``` 
   * 
   */

  var ImageLoading = function (elem, options) {
    this.options = $.extend({}, this.options, options);
    this.init(elem);
  };

  ImageLoading.prototype = {
    init: function (elem) {
      this.$elem = $(elem);
      this.getDOM();
      this.bindEvent();
    },

    options: {
      showItem: 4, // 一次最多显示几个
      imageContainer: '.js-image-container',
      image: '.js-image',
      prev: '.js-prev',
      next: '.js-next'
    },

    bindEvent: function () {
      var _this = this;
      this.$prev
      .on('click', function () {
        _this.renderImage(_this.$images);
      });
      this.$next
      .on('click', function () {
        _this.renderImage(_this.$images);
      });
      this.$imageContainer
      .on('swipeleft', function () {
        _this.renderImage(_this.$images);
      });
    },

    /** 获取 dom 元素 */
    getDOM: function (elem) {
      this.$imageContainer = $(this.options.imageContainer);
      this.$images = $(this.options.image);
      this.$prev = $(this.options.prev);
      this.$next = $(this.options.next);
    },

    /** 根据 img 标签 src 渲染图片路径 */
    renderImage: function (template) {
      var i;
      for (i = 0; i < this.$images.length; i++) {
        var imageSrc = this.$images.eq(i).attr('data-src');
        this.$images.eq(i)
        .attr({
          src: imageSrc
        });
      }
    }
  };

  $.fn.imageLoading = function (options) {
    var imageLoading = new ImageLoading(this, options);
    return this;
  }

})(jQuery);