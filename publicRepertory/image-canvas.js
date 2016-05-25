/**
 * Created by doray on 9/22/15.
 * Modified by Rosie on 10/20/15.
 */
(function(global, createjs, touch) {

  /**
   * 按照 Data URL 定义，匹配 Data URL 各项数据。
   * @type {RegExp}
   */
  var DATA_URL_REGX = /data:(image\/\w+)?(;base64,)?(.*)/;

  /**
   * @class
   *  MagazineCanvas
   *
   * @required createjs (https://code.createjs.com/easeljs-0.8.1.min.js)
   * @required touch (http://touch.code.baidu.com/touch-0.2.14.min.js)
   *
   * @description
   *  杂志图片的编辑器，支持选择图片，缩放图片，移动图片，旋转图片，
   *  添加新的图片，添加新的文字以及获取图片的 data URL 信息。
   *
   * @example
   *  // 初始化 MagazineCanvas 对象
   *  // 同时注册了图片的缩放事件、移动事件、旋转图片和选择图片事件
   *  var magazine = new MagazineCanvas({
   *    canvas: document.querySelector('...'),       // 或者 $(...)[0]
   *    imageChooser: document.querySelector('...')  // 或者 $(...)[0]
   *  });
   *
   * // 监听封面图片加载成功事件
   * magazine.afterImageLoaded = function(imageElement) {
   *  alert('image loaded');
   * };
   *
   * // 绘制文字
   * magazine.putText('hello world', {x: 0, y: 0}, '12px serif');
   *
   * // 绘制一张新的图片（不具备交互功能）
   * var image = new Image();
   * image.onload = function() {
   *  magazine.putImage(
   *    image,
   *    {x: 0, y: 0},
   *    {width: 100, height: 100},
   *    {x: 0, y: 0},
   *    {width: 100, height: 100}
   *  );
   * };
   * image.src = 'http://xxx/xxx.png';
   *
   * // 获取封面图片的 Data URL 数据
   * // 包含了杂志图片、通过 Magazine#putImage 添加的图片
   * // 和 MagazineCanvas#putText 添加的文字
   * var magazineDataURL = magazine.getDataURL(0.5);
   * var image = new Image();
   * image.src = magazineDataURL;
   *
   * // 获取封面图片的 base64 数据传输给服务器
   * var magazineBase64String = magazine.getBase64String(0.5);
   * $.ajax({
   *  type: 'post',
   *  url: ...,
   *  data: {
   *    image: magazineBase64String
   *  }
   * });
   *
   * @param {Object} options 杂志封面配置信息
   * @param {HTMLCanvasElement} options.canvas canvas 节点对象
   * @param {HTMLImageElement} options.imageChooser 杂志图片选择器对象
   */
  function MagazineCanvas(options) {
    if (!options.canvas || !options.imageChooser) {
      throw new Error('canvas/image chooser not defined');
    }

    this.$canvas = options.canvas;
    this.$imageSelector = options.imageChooser;

    this.canvasContext = this.$canvas.getContext('2d');
    this.canvasSize = {
      width: this.$canvas.width,
      height: this.$canvas.height
    };

    this.imageElement = new Image();
    this.imageStage = new createjs.Stage(this.$canvas);
    this.imageRoot = new createjs.Container();
    this.imageBitMap = null;

    this.imageStage.addChild(this.imageRoot);
    this.imageLastZoomScale = 0;
    this.imageLastRotation = 0;

    this.imagePosition = {x: 0, y: 0};

    if (!this.canvasContext) {
      throw new Error('cannot get the context of canvas');
    }

    this.bindEvents();
  }


  /**
   * @description
   *  绑定交互事件（图片选择，缩放，移动，旋转）。
   */
  MagazineCanvas.prototype.bindEvents = function() {
    var magazine = this;
    var $canvas = this.$canvas;
    var $imageSelector = this.$imageSelector;

    // 屏蔽 touchstart 的干扰
    touch.on($canvas, 'touchstart', function(event) {
      event.preventDefault();
    });

    // 缩放
    touch.on($canvas, 'pinchstart pinch', function(event) {
      magazine.zoom(event);
    });

    // 移动
    touch.on($canvas, 'dragstart drag', function(event) {
      magazine.move(event);
    });

    // 旋转
    touch.on($canvas, 'pinchstart rotate', function(event) {
      magazine.rotate(event);
    });

    // 选择图片并完成图片加载
    $imageSelector.addEventListener('change', function() {
      var file = this.files[0];
      var url = webkitURL.createObjectURL(file);
      magazine.setImage(url, function(imageElement) {
        magazine.afterImageLoaded.call(magazine, imageElement);
      });
      
    }, false);
  };


  /**
   * @description
   *  绘制一张新的图片，该图片不具备交互功能（无法缩放、移动或者重新选择）。
   *  目前绘制上去之后，无法撤销，只能通过 MagazineCanvas#flush 清除整个画布。
   *
   * @param  {HTMLImageElement} imageElement    图片的来源
   * @param  {Object} srcOffset                 裁剪图片的开始（左上角）坐标
   * @param  {Number} srcOffset.x               裁剪图片的开始 X 坐标
   * @param  {Number} srcOffset.y               裁剪图片的开始 Y 坐标
   * @param  {Object} srcSize                   裁剪图片的尺寸（高和宽），可选
   * @param  {Number} srcSize.width             裁剪图片的宽
   * @param  {Number} srcSize.height            裁剪图片的高
   * @param  {Object} drawOffset                绘制到画布上的开始（左上角）坐标，可选
   * @param  {Number} drawOffset.x              绘制到画布上的开始 X 坐标
   * @param  {Number} drawOffset.y              绘制到画布上的开始 Y 坐标
   * @param  {Object} drawSize                  绘制到画布上面的大小（高和宽），可选
   * @param  {Number} drawSize.width            绘制到画布上面的宽
   * @param  {Number} drawSize.height           绘制到画布上面的高
   */
  MagazineCanvas.prototype.putImage = function(imageElement, srcOffset, srcSize, drawOffset, drawSize) {
    var argsLength = arguments.length;
    var argList = [];
    var argObject;
    var i;

    argList.push(imageElement);
    argList.push(srcOffset.x);
    argList.push(srcOffset.y);

    if (argsLength > 2) {
      for (i = 2; i < argsLength; i++) {
        argObject = arguments[i];

        if (!argObject) {
          break;
        }

        argList.push(argObject.x || argObject.width);
        argList.push(argObject.y || argObject.height);
      }
    }

    this.canvasContext.drawImage.apply(this.canvasContext, argList);
  };


  /**
   * @description
   *  获取杂志的 Data URL 数据 data:image/*;base64,....，
   *  可直接用于 img 标签的 src 属性。
   *
   * @param {Number} quality 压缩质量，可选，默认为 0.5
   * @param {String} mimeType 图片类型，可选，默认为 image/png
   * @return {String} 杂志的 Data URL 数据（形式如 data:image/*;base64,....）
   */
  MagazineCanvas.prototype.getDataURL = function(quality, mimeType) {
    return this.$canvas.toDataURL(mimeType || "image/png", quality || 0.5);
  };


  /**
   * @description
   *  获取杂志的 base64 数据，不可用于 img 标签的 src 属性，
   *  但可上传给服务器生成图片文件。
   *
   * @param {Number} quality 压缩质量，可选，默认为 0.5
   * @param {String} mimeType 图片类型，可选，默认为 image/png
   * @return {String|Null} 杂志的 base64 数据（已截掉 "data:image/*;base64," 部分），
   *                       如果没有任何有效的 Data URL 数据，则返回 null
   */
  MagazineCanvas.prototype.getBase64String = function(quality, mimeType) {
    var extractedMeta = this.getDataURL(quality, mimeType).match(DATA_URL_REGX);
    return extractedMeta.length === 4 ? extractedMeta[3] : null;
  };


  /**
   * @description
   *  缩放图片。
   *
   * @param  {Event} event touch 库的缩放事件对象（已包含了缩放比例数据）
   */
  MagazineCanvas.prototype.zoom = function(event) {
    var scale;
    switch(event.type) {
      case 'pinchstart':
        this.imageLastZoomScale = this.imageBitMap.scaleX;
        break;
      case 'pinch':
        scale = (event.scale - 1);
        if ((this.imageLastZoomScale - 0.02 > 0.2 && scale < 0)
          || (this.imageLastZoomScale + 0.02 < 5 && scale > 0)) {
          this.imageBitMap.scaleX = this.imageLastZoomScale + scale;
          this.imageBitMap.scaleY = this.imageBitMap.scaleX;
          this.imageStage.update();
        }
        break;
    }
  };


  /**
   * @description
   *  移动图片。
   *
   * @param  {Event} event touch 库的移动事件对象（已包含了位移数据）
   */
  MagazineCanvas.prototype.move = function(event) {
    switch(event.type) {
      case 'dragstart':
        this.imagePosition.x = this.imageBitMap.x;
        this.imagePosition.y = this.imageBitMap.y;
        break;
      case 'drag':
        this.imageBitMap.x = this.imagePosition.x + event.x;
        this.imageBitMap.y = this.imagePosition.y + event.y;
        this.imageStage.update();
        break;
    }
  };


  MagazineCanvas.prototype.rotate = function(event) {
    switch(event.type) {
      case 'pinchstart':
        this.imageLastRotation = this.imageBitMap.rotation;
        break;
      case 'rotate' :
        this.imageBitMap.rotation = this.imageLastRotation + event.rotation;
        this.imageStage.update();
        break;
    }
  };

  /**
   * @description
   *  设置图片。
   *
   * @param  {Object}   imageSrcURL    图片链接
   * @param  {Function} loadedCallback 设置成功后的回调函数
   */
  MagazineCanvas.prototype.setImage = function(imageSrcURL, loadedCallback) {
    var magazine = this;

    this.imageElement.onload = function() {
      magazine.drawImage.call(magazine);

      magazine.imageBitMap = new createjs.Bitmap(this);

      magazine.imageBitMap.regX = this.width / 2;
      magazine.imageBitMap.regY = this.height / 2;
      magazine.imageBitMap.x = magazine.canvasSize.width / 2;
      magazine.imageBitMap.y = magazine.canvasSize.height / 2;
      magazine.imageRoot.addChild(magazine.imageBitMap);

      if (!!loadedCallback) {
        loadedCallback.call(magazine, this);
      }
    };

    magazine.imageElement.src = imageSrcURL;
  };


  /**
   * @description
   *  清除画布的所有数据。
   */
  MagazineCanvas.prototype.flush = function() {
    this.canvasContext.clearRect(
      0, 0,
      this.canvasSize.width, this.canvasSize.height
    );
  };


  /**
   * @description
   *  在杂志上面绘制文字，绘制完成后无法撤销。
   *
   * @example
   *  var magazine = new MagazineCanvas(...);
   *  magazine.putText(
   *    'Hello World',
   *    {
   *      x: 0,
   *      y: 0
   *    },
   *    {
   *      color: 'rgb(233,233,233)',
   *      size: '14px',
   *      family: 'san-serif'
   *    }
   *  );
   *
   * @param  {String} text          绘制到杂志上的文字
   * @param  {Object} position      绘制的位置
   * @param  {Number} position.x    绘制的 X 坐标
   * @param  {Number} position.y    绘制的 Y 坐标
   * @param  {Object} style         设置文字的样式
   * @param  {String} style.color   文字的颜色，格式为 rgb(X,X,X)，默认为 'rgba(0,0,0)'
   * @param  {String} style.size    字重，格式为 normal/bold/400/500/...，默认为 'normal'
   * @param  {String} style.size    文字的大小，格式为 XXpx，默认为 '12px'
   * @param  {String} style.family  文字的字体，默认为 'serif'
   */
  MagazineCanvas.prototype.putText = function(text, position, style) {
    this.canvasContext.fillStyle = style.color || 'rgb(0,0,0)';
    this.canvasContext.font = (style.weight || 'normal') + ' ' + (style.size || '12px') + ' ' + (style.family || 'serif');
    this.canvasContext.fillText(text, position.x, position.y);
  };


  /**
   * @description
   *  绘制杂志图片（初始化使用），默认选取图片的中间部分显示在杂志编辑器上。
   */
  MagazineCanvas.prototype.drawImage = function() {
    var imageWidth = this.imageElement.width;
    var imageHeight = this.imageElement.height;
    var canvasWidth = this.canvasSize.width;
    var canvasHeight = this.canvasSize.height;

    var imageRatio = imageWidth / imageHeight;
    var canvasRatio = canvasWidth / canvasHeight;
    var isImageLandscape = imageRatio >= 1;
    var isCanvasLandscape = canvasRatio >= 1;
    var needImageCropping = (isImageLandscape === isCanvasLandscape) && isImageLandscape;

    var srcOffsetX = (needImageCropping)
                     ? (imageWidth - canvasWidth) / 2
                     : 0;
    var srcOffsetY = (needImageCropping)
                     ? (imageHeight - canvasHeight) / 2
                     : 0;
    var srcWidth = (needImageCropping)
                   ? canvasWidth
                   : imageWidth;
    var srcHeight = (needImageCropping)
                   ? canvasHeight
                   : imageHeight;

    var cvsOffsetX = 0;
    var cvsOffsetY = 0;
    var cvsWidth = canvasWidth;
    var cvsHeight = canvasHeight;

    this.canvasContext.drawImage(this.imageElement,
      srcOffsetX, srcOffsetY,
      srcWidth, srcHeight,
      cvsOffsetX, cvsOffsetY,
      cvsWidth, cvsHeight
    );
  };


  /**
   * @description
   *  杂志图片加载成功后的回调函数。可覆写。
   *
   * @param  {HTMLImageElement} imageElement 杂志图片的 HTMLElement
   */
  MagazineCanvas.prototype.afterImageLoaded = function(imageElement) {};


  global.MagazineCanvas = MagazineCanvas;

})(window, createjs, touch);
