function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// This is not really a perfect check, but works fine.
// From http://stackoverflow.com/questions/384286
var HAS_DOM_2 = (typeof HTMLElement === "undefined" ? "undefined" : _typeof(HTMLElement)) === "object";
function isDOMElement(obj) {
  return HAS_DOM_2 ? obj instanceof HTMLElement : obj && _typeof(obj) === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string";
}
function addClasses(el, classNames) {
  classNames.forEach(function (className) {
    el.classList.add(className);
  });
}
function removeClasses(el, classNames) {
  classNames.forEach(function (className) {
    el.classList.remove(className);
  });
}

/* UNMINIFIED RULES

const RULES = `
@keyframes noop {
  0% { zoom: 1; }
}

@-webkit-keyframes noop {
  0% { zoom: 1; }
}

.drift-zoom-pane.drift-open {
  display: block;
}

.drift-zoom-pane.drift-opening, .drift-zoom-pane.drift-closing {
  animation: noop 1ms;
  -webkit-animation: noop 1ms;
}

.drift-zoom-pane {
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.drift-zoom-pane-loader {
  display: none;
}

.drift-zoom-pane img {
  position: absolute;
  display: block;
  max-width: none;
  max-height: none;
}

.drift-bounding-box {
  position: absolute;
  pointer-events: none;
}
`;

*/
var RULES = ".drift-bounding-box,.drift-zoom-pane{position:absolute;z-index:2;pointer-events:none}@keyframes noop{0%{zoom:1}}@-webkit-keyframes noop{0%{zoom:1}}.drift-zoom-pane.drift-open{display:block}.drift-zoom-pane.drift-closing,.drift-zoom-pane.drift-opening{animation:noop 1ms;-webkit-animation:noop 1ms}.drift-zoom-pane{overflow:hidden;width:100%;height:100%;top:0;left:0}.drift-zoom-pane-loader{display:none}.drift-zoom-pane img{position:absolute;display:block;max-width:none;max-height:none}";
function injectBaseStylesheet() {
  if (document.querySelector(".drift-base-styles")) {
    return;
  }

  var styleEl = document.createElement("style");
  styleEl.type = "text/css";
  styleEl.classList.add("drift-base-styles");
  styleEl.appendChild(document.createTextNode(RULES));
  var head = document.head;
  head.insertBefore(styleEl, head.firstChild);
}

function throwIfMissing() {
  throw new Error("Missing parameter");
}

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$3(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$3(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$3(Constructor.prototype, protoProps); if (staticProps) _defineProperties$3(Constructor, staticProps); return Constructor; }

var BoundingBox = /*#__PURE__*/function () {
  function BoundingBox(options) {
    _classCallCheck$3(this, BoundingBox);

    this.isShowing = false;
    var _options$namespace = options.namespace,
        namespace = _options$namespace === void 0 ? null : _options$namespace,
        _options$zoomFactor = options.zoomFactor,
        zoomFactor = _options$zoomFactor === void 0 ? throwIfMissing() : _options$zoomFactor,
        _options$containerEl = options.containerEl,
        containerEl = _options$containerEl === void 0 ? throwIfMissing() : _options$containerEl;
    this.settings = {
      namespace: namespace,
      zoomFactor: zoomFactor,
      containerEl: containerEl
    };
    this.openClasses = this._buildClasses("open");

    this._buildElement();
  }

  _createClass$3(BoundingBox, [{
    key: "_buildClasses",
    value: function _buildClasses(suffix) {
      var classes = ["drift-".concat(suffix)];
      var ns = this.settings.namespace;

      if (ns) {
        classes.push("".concat(ns, "-").concat(suffix));
      }

      return classes;
    }
  }, {
    key: "_buildElement",
    value: function _buildElement() {
      this.el = document.createElement("div");
      addClasses(this.el, this._buildClasses("bounding-box"));
    }
  }, {
    key: "show",
    value: function show(zoomPaneWidth, zoomPaneHeight) {
      this.isShowing = true;
      this.settings.containerEl.appendChild(this.el);
      var style = this.el.style;
      style.width = "".concat(Math.round(zoomPaneWidth / this.settings.zoomFactor), "px");
      style.height = "".concat(Math.round(zoomPaneHeight / this.settings.zoomFactor), "px");
      addClasses(this.el, this.openClasses);
    }
  }, {
    key: "hide",
    value: function hide() {
      if (this.isShowing) {
        this.settings.containerEl.removeChild(this.el);
      }

      this.isShowing = false;
      removeClasses(this.el, this.openClasses);
    }
  }, {
    key: "setPosition",
    value: function setPosition(percentageOffsetX, percentageOffsetY, triggerRect) {
      var pageXOffset = window.pageXOffset;
      var pageYOffset = window.pageYOffset;
      var inlineLeft = triggerRect.left + percentageOffsetX * triggerRect.width - this.el.clientWidth / 2 + pageXOffset;
      var inlineTop = triggerRect.top + percentageOffsetY * triggerRect.height - this.el.clientHeight / 2 + pageYOffset;

      if (inlineLeft < triggerRect.left + pageXOffset) {
        inlineLeft = triggerRect.left + pageXOffset;
      } else if (inlineLeft + this.el.clientWidth > triggerRect.left + triggerRect.width + pageXOffset) {
        inlineLeft = triggerRect.left + triggerRect.width - this.el.clientWidth + pageXOffset;
      }

      if (inlineTop < triggerRect.top + pageYOffset) {
        inlineTop = triggerRect.top + pageYOffset;
      } else if (inlineTop + this.el.clientHeight > triggerRect.top + triggerRect.height + pageYOffset) {
        inlineTop = triggerRect.top + triggerRect.height - this.el.clientHeight + pageYOffset;
      }

      this.el.style.left = "".concat(inlineLeft, "px");
      this.el.style.top = "".concat(inlineTop, "px");
    }
  }]);

  return BoundingBox;
}();

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$2(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$2(Constructor.prototype, protoProps); if (staticProps) _defineProperties$2(Constructor, staticProps); return Constructor; }

var Trigger = /*#__PURE__*/function () {
  function Trigger() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck$2(this, Trigger);

    this._show = this._show.bind(this);
    this._hide = this._hide.bind(this);
    this._handleEntry = this._handleEntry.bind(this);
    this._handleMovement = this._handleMovement.bind(this);
    var _options$el = options.el,
        el = _options$el === void 0 ? throwIfMissing() : _options$el,
        _options$zoomPane = options.zoomPane,
        zoomPane = _options$zoomPane === void 0 ? throwIfMissing() : _options$zoomPane,
        _options$sourceAttrib = options.sourceAttribute,
        sourceAttribute = _options$sourceAttrib === void 0 ? throwIfMissing() : _options$sourceAttrib,
        _options$handleTouch = options.handleTouch,
        handleTouch = _options$handleTouch === void 0 ? throwIfMissing() : _options$handleTouch,
        _options$onShow = options.onShow,
        onShow = _options$onShow === void 0 ? null : _options$onShow,
        _options$onHide = options.onHide,
        onHide = _options$onHide === void 0 ? null : _options$onHide,
        _options$hoverDelay = options.hoverDelay,
        hoverDelay = _options$hoverDelay === void 0 ? 0 : _options$hoverDelay,
        _options$touchDelay = options.touchDelay,
        touchDelay = _options$touchDelay === void 0 ? 0 : _options$touchDelay,
        _options$hoverBoundin = options.hoverBoundingBox,
        hoverBoundingBox = _options$hoverBoundin === void 0 ? throwIfMissing() : _options$hoverBoundin,
        _options$touchBoundin = options.touchBoundingBox,
        touchBoundingBox = _options$touchBoundin === void 0 ? throwIfMissing() : _options$touchBoundin,
        _options$namespace = options.namespace,
        namespace = _options$namespace === void 0 ? null : _options$namespace,
        _options$zoomFactor = options.zoomFactor,
        zoomFactor = _options$zoomFactor === void 0 ? throwIfMissing() : _options$zoomFactor,
        _options$boundingBoxC = options.boundingBoxContainer,
        boundingBoxContainer = _options$boundingBoxC === void 0 ? throwIfMissing() : _options$boundingBoxC,
        _options$passive = options.passive,
        passive = _options$passive === void 0 ? false : _options$passive;
    this.settings = {
      el: el,
      zoomPane: zoomPane,
      sourceAttribute: sourceAttribute,
      handleTouch: handleTouch,
      onShow: onShow,
      onHide: onHide,
      hoverDelay: hoverDelay,
      touchDelay: touchDelay,
      hoverBoundingBox: hoverBoundingBox,
      touchBoundingBox: touchBoundingBox,
      namespace: namespace,
      zoomFactor: zoomFactor,
      boundingBoxContainer: boundingBoxContainer,
      passive: passive
    };

    if (this.settings.hoverBoundingBox || this.settings.touchBoundingBox) {
      this.boundingBox = new BoundingBox({
        namespace: this.settings.namespace,
        zoomFactor: this.settings.zoomFactor,
        containerEl: this.settings.boundingBoxContainer
      });
    }

    this.enabled = true;

    this._bindEvents();
  }

  _createClass$2(Trigger, [{
    key: "_preventDefault",
    value: function _preventDefault(event) {
      event.preventDefault();
    }
  }, {
    key: "_preventDefaultAllowTouchScroll",
    value: function _preventDefaultAllowTouchScroll(event) {
      if (!this.settings.touchDelay || !this._isTouchEvent(event) || this.isShowing) {
        event.preventDefault();
      }
    }
  }, {
    key: "_isTouchEvent",
    value: function _isTouchEvent(event) {
      return !!event.touches;
    }
  }, {
    key: "_bindEvents",
    value: function _bindEvents() {
      this.settings.el.addEventListener("mouseenter", this._handleEntry, false);
      this.settings.el.addEventListener("mouseleave", this._hide, false);
      this.settings.el.addEventListener("mousemove", this._handleMovement, false);
      var isPassive = {
        passive: this.settings.passive
      };

      if (this.settings.handleTouch) {
        this.settings.el.addEventListener("touchstart", this._handleEntry, isPassive);
        this.settings.el.addEventListener("touchend", this._hide, false);
        this.settings.el.addEventListener("touchmove", this._handleMovement, isPassive);
      } else {
        this.settings.el.addEventListener("touchstart", this._preventDefault, isPassive);
        this.settings.el.addEventListener("touchend", this._preventDefault, false);
        this.settings.el.addEventListener("touchmove", this._preventDefault, isPassive);
      }
    }
  }, {
    key: "_unbindEvents",
    value: function _unbindEvents() {
      this.settings.el.removeEventListener("mouseenter", this._handleEntry, false);
      this.settings.el.removeEventListener("mouseleave", this._hide, false);
      this.settings.el.removeEventListener("mousemove", this._handleMovement, false);

      if (this.settings.handleTouch) {
        this.settings.el.removeEventListener("touchstart", this._handleEntry, false);
        this.settings.el.removeEventListener("touchend", this._hide, false);
        this.settings.el.removeEventListener("touchmove", this._handleMovement, false);
      } else {
        this.settings.el.removeEventListener("touchstart", this._preventDefault, false);
        this.settings.el.removeEventListener("touchend", this._preventDefault, false);
        this.settings.el.removeEventListener("touchmove", this._preventDefault, false);
      }
    }
  }, {
    key: "_handleEntry",
    value: function _handleEntry(e) {
      this._preventDefaultAllowTouchScroll(e);

      this._lastMovement = e;

      if (e.type == "mouseenter" && this.settings.hoverDelay) {
        this.entryTimeout = setTimeout(this._show, this.settings.hoverDelay);
      } else if (this.settings.touchDelay) {
        this.entryTimeout = setTimeout(this._show, this.settings.touchDelay);
      } else {
        this._show();
      }
    }
  }, {
    key: "_show",
    value: function _show() {
      if (!this.enabled) {
        return;
      }

      var onShow = this.settings.onShow;

      if (onShow && typeof onShow === "function") {
        onShow();
      }

      this.settings.zoomPane.show(this.settings.el.getAttribute(this.settings.sourceAttribute), this.settings.el.clientWidth, this.settings.el.clientHeight);

      if (this._lastMovement) {
        var touchActivated = this._lastMovement.touches;

        if (touchActivated && this.settings.touchBoundingBox || !touchActivated && this.settings.hoverBoundingBox) {
          this.boundingBox.show(this.settings.zoomPane.el.clientWidth, this.settings.zoomPane.el.clientHeight);
        }
      }

      this._handleMovement();
    }
  }, {
    key: "_hide",
    value: function _hide(e) {
      if (e) {
        this._preventDefaultAllowTouchScroll(e);
      }

      this._lastMovement = null;

      if (this.entryTimeout) {
        clearTimeout(this.entryTimeout);
      }

      if (this.boundingBox) {
        this.boundingBox.hide();
      }

      var onHide = this.settings.onHide;

      if (onHide && typeof onHide === "function") {
        onHide();
      }

      this.settings.zoomPane.hide();
    }
  }, {
    key: "_handleMovement",
    value: function _handleMovement(e) {
      if (e) {
        this._preventDefaultAllowTouchScroll(e);

        this._lastMovement = e;
      } else if (this._lastMovement) {
        e = this._lastMovement;
      } else {
        return;
      }

      var movementX;
      var movementY;

      if (e.touches) {
        var firstTouch = e.touches[0];
        movementX = firstTouch.clientX;
        movementY = firstTouch.clientY;
      } else {
        movementX = e.clientX;
        movementY = e.clientY;
      }

      var el = this.settings.el;
      var rect = el.getBoundingClientRect();
      var offsetX = movementX - rect.left;
      var offsetY = movementY - rect.top;
      var percentageOffsetX = offsetX / this.settings.el.clientWidth;
      var percentageOffsetY = offsetY / this.settings.el.clientHeight;

      if (this.boundingBox) {
        this.boundingBox.setPosition(percentageOffsetX, percentageOffsetY, rect);
      }

      this.settings.zoomPane.setPosition(percentageOffsetX, percentageOffsetY, rect);
    }
  }, {
    key: "isShowing",
    get: function get() {
      return this.settings.zoomPane.isShowing;
    }
  }]);

  return Trigger;
}();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }

var ZoomPane = /*#__PURE__*/function () {
  function ZoomPane() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck$1(this, ZoomPane);

    // All officially-supported browsers have this, but it's easy to
    // account for, just in case.
    this.HAS_ANIMATION = false;

    if (typeof document !== "undefined") {
      var divStyle = document.createElement("div").style;
      this.HAS_ANIMATION = "animation" in divStyle || "webkitAnimation" in divStyle;
    }

    this._completeShow = this._completeShow.bind(this);
    this._completeHide = this._completeHide.bind(this);
    this._handleLoad = this._handleLoad.bind(this);
    this.isShowing = false;
    var _options$container = options.container,
        container = _options$container === void 0 ? null : _options$container,
        _options$zoomFactor = options.zoomFactor,
        zoomFactor = _options$zoomFactor === void 0 ? throwIfMissing() : _options$zoomFactor,
        _options$inline = options.inline,
        inline = _options$inline === void 0 ? throwIfMissing() : _options$inline,
        _options$namespace = options.namespace,
        namespace = _options$namespace === void 0 ? null : _options$namespace,
        _options$showWhitespa = options.showWhitespaceAtEdges,
        showWhitespaceAtEdges = _options$showWhitespa === void 0 ? throwIfMissing() : _options$showWhitespa,
        _options$containInlin = options.containInline,
        containInline = _options$containInlin === void 0 ? throwIfMissing() : _options$containInlin,
        _options$inlineOffset = options.inlineOffsetX,
        inlineOffsetX = _options$inlineOffset === void 0 ? 0 : _options$inlineOffset,
        _options$inlineOffset2 = options.inlineOffsetY,
        inlineOffsetY = _options$inlineOffset2 === void 0 ? 0 : _options$inlineOffset2,
        _options$inlineContai = options.inlineContainer,
        inlineContainer = _options$inlineContai === void 0 ? document.body : _options$inlineContai;

    this.settings = {
      container: container,
      zoomFactor: zoomFactor,
      inline: inline,
      namespace: namespace,
      showWhitespaceAtEdges: showWhitespaceAtEdges,
      containInline: containInline,
      inlineOffsetX: inlineOffsetX,
      inlineOffsetY: inlineOffsetY,
      inlineContainer: inlineContainer,
      onZoomLoad: options.onZoomLoad,
      onZoomLoaded: options.onZoomLoaded,
    };
    this.openClasses = this._buildClasses("open");
    this.openingClasses = this._buildClasses("opening");
    this.closingClasses = this._buildClasses("closing");
    this.inlineClasses = this._buildClasses("inline");
    this.loadingClasses = this._buildClasses("loading");

    this._buildElement();
  }

  _createClass$1(ZoomPane, [{
    key: "_buildClasses",
    value: function _buildClasses(suffix) {
      var classes = ["drift-".concat(suffix)];
      var ns = this.settings.namespace;

      if (ns) {
        classes.push("".concat(ns, "-").concat(suffix));
      }

      return classes;
    }
  }, {
    key: "_buildElement",
    value: function _buildElement() {
      this.el = document.createElement("div");
      addClasses(this.el, this._buildClasses("zoom-pane"));
      var loaderEl = document.createElement("div");
      addClasses(loaderEl, this._buildClasses("zoom-pane-loader"));
      this.el.appendChild(loaderEl);
      this.imgEl = document.createElement("img");
      this.el.appendChild(this.imgEl);
    }
  }, {
    key: "_setImageURL",
    value: function _setImageURL(imageURL) {
      this.imgEl.setAttribute("src", imageURL);
    }
  }, {
    key: "_setImageSize",
    value: function _setImageSize(triggerWidth, triggerHeight) {
      this.imgEl.style.width = "".concat(triggerWidth * this.settings.zoomFactor, "px");
      this.imgEl.style.height = "".concat(triggerHeight * this.settings.zoomFactor, "px");
    } // `percentageOffsetX` and `percentageOffsetY` must be percentages
    // expressed as floats between `0' and `1`.

  }, {
    key: "setPosition",
    value: function setPosition(percentageOffsetX, percentageOffsetY, triggerRect) {
      var imgElWidth = this.imgEl.offsetWidth;
      var imgElHeight = this.imgEl.offsetHeight;
      var elWidth = this.el.offsetWidth;
      var elHeight = this.el.offsetHeight;
      var centreOfContainerX = elWidth / 2;
      var centreOfContainerY = elHeight / 2;
      var targetImgXToBeCentre = imgElWidth * percentageOffsetX;
      var targetImgYToBeCentre = imgElHeight * percentageOffsetY;
      var left = centreOfContainerX - targetImgXToBeCentre;
      var top = centreOfContainerY - targetImgYToBeCentre;
      var differenceBetweenContainerWidthAndImgWidth = elWidth - imgElWidth;
      var differenceBetweenContainerHeightAndImgHeight = elHeight - imgElHeight;
      var isContainerLargerThanImgX = differenceBetweenContainerWidthAndImgWidth > 0;
      var isContainerLargerThanImgY = differenceBetweenContainerHeightAndImgHeight > 0;
      var minLeft = isContainerLargerThanImgX ? differenceBetweenContainerWidthAndImgWidth / 2 : 0;
      var minTop = isContainerLargerThanImgY ? differenceBetweenContainerHeightAndImgHeight / 2 : 0;
      var maxLeft = isContainerLargerThanImgX ? differenceBetweenContainerWidthAndImgWidth / 2 : differenceBetweenContainerWidthAndImgWidth;
      var maxTop = isContainerLargerThanImgY ? differenceBetweenContainerHeightAndImgHeight / 2 : differenceBetweenContainerHeightAndImgHeight;

      if (this.el.parentElement === this.settings.inlineContainer) {
        // This may be needed in the future to deal with browser event
        // inconsistencies, but it's difficult to tell for sure.
        // let scrollX = isTouch ? 0 : window.scrollX;
        // let scrollY = isTouch ? 0 : window.scrollY;
        var scrollX = window.pageXOffset;
        var scrollY = window.pageYOffset;
        var inlineLeft = triggerRect.left + percentageOffsetX * triggerRect.width - elWidth / 2 + this.settings.inlineOffsetX + scrollX;
        var inlineTop = triggerRect.top + percentageOffsetY * triggerRect.height - elHeight / 2 + this.settings.inlineOffsetY + scrollY;

        if (this.settings.containInline) {
          if (inlineLeft < triggerRect.left + scrollX) {
            inlineLeft = triggerRect.left + scrollX;
          } else if (inlineLeft + elWidth > triggerRect.left + triggerRect.width + scrollX) {
            inlineLeft = triggerRect.left + triggerRect.width - elWidth + scrollX;
          }

          if (inlineTop < triggerRect.top + scrollY) {
            inlineTop = triggerRect.top + scrollY;
          } else if (inlineTop + elHeight > triggerRect.top + triggerRect.height + scrollY) {
            inlineTop = triggerRect.top + triggerRect.height - elHeight + scrollY;
          }
        }

        this.el.style.left = "".concat(inlineLeft, "px");
        this.el.style.top = "".concat(inlineTop, "px");
      }

      if (!this.settings.showWhitespaceAtEdges) {
        if (left > minLeft) {
          left = minLeft;
        } else if (left < maxLeft) {
          left = maxLeft;
        }

        if (top > minTop) {
          top = minTop;
        } else if (top < maxTop) {
          top = maxTop;
        }
      }

      this.imgEl.style.transform = "translate(".concat(left, "px, ").concat(top, "px)");
      this.imgEl.style.webkitTransform = "translate(".concat(left, "px, ").concat(top, "px)");
    }
  }, {
    key: "_removeListenersAndResetClasses",
    value: function _removeListenersAndResetClasses() {
      this.el.removeEventListener("animationend", this._completeShow, false);
      this.el.removeEventListener("animationend", this._completeHide, false);
      this.el.removeEventListener("webkitAnimationEnd", this._completeShow, false);
      this.el.removeEventListener("webkitAnimationEnd", this._completeHide, false);
      removeClasses(this.el, this.openClasses);
      removeClasses(this.el, this.closingClasses);
    }
  }, {
    key: "show",
    value: function show(imageURL, triggerWidth, triggerHeight) {
      this._removeListenersAndResetClasses();

      this.isShowing = true;
      addClasses(this.el, this.openClasses);

      if (this.imgEl.getAttribute("src") != imageURL) {
        addClasses(this.el, this.loadingClasses);
        this.imgEl.addEventListener("load", this._handleLoad, false);
        this.settings.onZoomLoad();
        this._setImageURL(imageURL);
      }

      this._setImageSize(triggerWidth, triggerHeight);

      if (this._isInline) {
        this._showInline();
      } else {
        this._showInContainer();
      }

      if (this.HAS_ANIMATION) {
        this.el.addEventListener("animationend", this._completeShow, false);
        this.el.addEventListener("webkitAnimationEnd", this._completeShow, false);
        addClasses(this.el, this.openingClasses);
      }
    }
  }, {
    key: "_showInline",
    value: function _showInline() {
      this.settings.inlineContainer.appendChild(this.el);
      addClasses(this.el, this.inlineClasses);
    }
  }, {
    key: "_showInContainer",
    value: function _showInContainer() {
      this.settings.container.appendChild(this.el);
    }
  }, {
    key: "hide",
    value: function hide() {
      this._removeListenersAndResetClasses();

      this.isShowing = false;

      if (this.HAS_ANIMATION) {
        this.el.addEventListener("animationend", this._completeHide, false);
        this.el.addEventListener("webkitAnimationEnd", this._completeHide, false);
        addClasses(this.el, this.closingClasses);
      } else {
        removeClasses(this.el, this.openClasses);
        removeClasses(this.el, this.inlineClasses);
      }
    }
  }, {
    key: "_completeShow",
    value: function _completeShow() {
      this.el.removeEventListener("animationend", this._completeShow, false);
      this.el.removeEventListener("webkitAnimationEnd", this._completeShow, false);
      removeClasses(this.el, this.openingClasses);
    }
  }, {
    key: "_completeHide",
    value: function _completeHide() {
      this.el.removeEventListener("animationend", this._completeHide, false);
      this.el.removeEventListener("webkitAnimationEnd", this._completeHide, false);
      removeClasses(this.el, this.openClasses);
      removeClasses(this.el, this.closingClasses);
      removeClasses(this.el, this.inlineClasses);
      this.el.style.left = "";
      this.el.style.top = ""; // The window could have been resized above or below `inline`
      // limits since the ZoomPane was shown. Because of this, we
      // can't rely on `this._isInline` here.

      if (this.el.parentElement === this.settings.container) {
        this.settings.container.removeChild(this.el);
      } else if (this.el.parentElement === this.settings.inlineContainer) {
        this.settings.inlineContainer.removeChild(this.el);
      }
    }
  }, {
    key: "_handleLoad",
    value: function _handleLoad() {
        this.imgEl.removeEventListener("load", this._handleLoad, false);
        removeClasses(this.el, this.loadingClasses);
        this.settings.onZoomLoaded();
    }
  }, {
    key: "_isInline",
    get: function get() {
      var inline = this.settings.inline;
      return inline === true || typeof inline === "number" && window.innerWidth <= inline;
    }
  }]);

  return ZoomPane;
}();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Drift = /*#__PURE__*/function () {
  function Drift(triggerEl) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Drift);

    this.VERSION = "1.4.5";
    this.triggerEl = triggerEl;
    this.destroy = this.destroy.bind(this);

    if (!isDOMElement(this.triggerEl)) {
      throw new TypeError("`new Drift` requires a DOM element as its first argument.");
    } // Prefix for generated element class names (e.g. `my-ns` will
    // result in classes such as `my-ns-pane`. Default `drift-`
    // prefixed classes will always be added as well.
    var onZoomLoad = options["onZoomLoad"] || function(){}; 
    var onZoomLoaded = options["onZoomLoaded"] || function(){}; 


    var namespace = options["namespace"] || null; // Whether the ZoomPane should show whitespace when near the edges.

    var showWhitespaceAtEdges = options["showWhitespaceAtEdges"] || false; // Whether the inline ZoomPane should stay inside
    // the bounds of its image.

    var containInline = options["containInline"] || false; // How much to offset the ZoomPane from the
    // interaction point when inline.

    var inlineOffsetX = options["inlineOffsetX"] || 0;
    var inlineOffsetY = options["inlineOffsetY"] || 0; // A DOM element to append the inline ZoomPane to

    var inlineContainer = options["inlineContainer"] || document.body; // Which trigger attribute to pull the ZoomPane image source from.

    var sourceAttribute = options["sourceAttribute"] || "data-zoom"; // How much to magnify the trigger by in the ZoomPane.
    // (e.g., `zoomFactor: 3` will result in a 900 px wide ZoomPane imag
    // if the trigger is displayed at 300 px wide)

    var zoomFactor = options["zoomFactor"] || 3; // A DOM element to append the non-inline ZoomPane to.
    // Required if `inlinePane !== true`.

    var paneContainer = options["paneContainer"] === undefined ? document.body : options["paneContainer"]; // When to switch to an inline ZoomPane. This can be a boolean or
    // an integer. If `true`, the ZoomPane will always be inline,
    // if `false`, it will switch to inline when `windowWidth <= inlinePane`

    var inlinePane = options["inlinePane"] || 375; // If `true`, touch events will trigger the zoom, like mouse events.

    var handleTouch = "handleTouch" in options ? !!options["handleTouch"] : true; // If present (and a function), this will be called
    // whenever the ZoomPane is shown.

    var onShow = options["onShow"] || null; // If present (and a function), this will be called
    // whenever the ZoomPane is hidden.

    var onHide = options["onHide"] || null; // Add base styles to the page. See the "Theming"
    // section of README.md for more information.

    var injectBaseStyles = "injectBaseStyles" in options ? !!options["injectBaseStyles"] : true; // An optional number that determines how long to wait before
    // showing the ZoomPane because of a `mouseenter` event.

    var hoverDelay = options["hoverDelay"] || 0; // An optional number that determines how long to wait before
    // showing the ZoomPane because of a `touchstart` event.
    // It's unlikely that you would want to use this option, since
    // "tap and hold" is much more intentional than a hover event.

    var touchDelay = options["touchDelay"] || 0; // If true, a bounding box will show the area currently being previewed
    // during mouse hover

    var hoverBoundingBox = options["hoverBoundingBox"] || false; // If true, a bounding box will show the area currently being previewed
    // during touch events

    var touchBoundingBox = options["touchBoundingBox"] || false; // A DOM element to append the bounding box to.

    var boundingBoxContainer = options["boundingBoxContainer"] || document.body; // If true, the events related to handleTouch use passive listeners in
    // order to improve performance for touch devices.

    var passive = options["passive"] || false;

    if (inlinePane !== true && !isDOMElement(paneContainer)) {
      throw new TypeError("`paneContainer` must be a DOM element when `inlinePane !== true`");
    }

    if (!isDOMElement(inlineContainer)) {
      throw new TypeError("`inlineContainer` must be a DOM element");
    }

    this.settings = {
      namespace: namespace,
      showWhitespaceAtEdges: showWhitespaceAtEdges,
      containInline: containInline,
      inlineOffsetX: inlineOffsetX,
      inlineOffsetY: inlineOffsetY,
      inlineContainer: inlineContainer,
      sourceAttribute: sourceAttribute,
      zoomFactor: zoomFactor,
      paneContainer: paneContainer,
      inlinePane: inlinePane,
      handleTouch: handleTouch,
      onShow: onShow,
      onHide: onHide,
      injectBaseStyles: injectBaseStyles,
      hoverDelay: hoverDelay,
      touchDelay: touchDelay,
      hoverBoundingBox: hoverBoundingBox,
      touchBoundingBox: touchBoundingBox,
      boundingBoxContainer: boundingBoxContainer,
      passive: passive,
      onZoomLoad: onZoomLoad,
      onZoomLoaded: onZoomLoaded
    };

    if (this.settings.injectBaseStyles) {
      injectBaseStylesheet();
    }

    this._buildZoomPane();

    this._buildTrigger();
  }

  _createClass(Drift, [{
    key: "_buildZoomPane",
    value: function _buildZoomPane() {
      this.zoomPane = new ZoomPane({
        container: this.settings.paneContainer,
        zoomFactor: this.settings.zoomFactor,
        showWhitespaceAtEdges: this.settings.showWhitespaceAtEdges,
        containInline: this.settings.containInline,
        inline: this.settings.inlinePane,
        namespace: this.settings.namespace,
        inlineOffsetX: this.settings.inlineOffsetX,
        inlineOffsetY: this.settings.inlineOffsetY,
        inlineContainer: this.settings.inlineContainer,
        onZoomLoad: this.settings.onZoomLoad,
        onZoomLoaded: this.settings.onZoomLoaded
      });
    }
  }, {
    key: "_buildTrigger",
    value: function _buildTrigger() {
      this.trigger = new Trigger({
        el: this.triggerEl,
        zoomPane: this.zoomPane,
        handleTouch: this.settings.handleTouch,
        onShow: this.settings.onShow,
        onHide: this.settings.onHide,
        sourceAttribute: this.settings.sourceAttribute,
        hoverDelay: this.settings.hoverDelay,
        touchDelay: this.settings.touchDelay,
        hoverBoundingBox: this.settings.hoverBoundingBox,
        touchBoundingBox: this.settings.touchBoundingBox,
        namespace: this.settings.namespace,
        zoomFactor: this.settings.zoomFactor,
        boundingBoxContainer: this.settings.boundingBoxContainer,
        passive: this.settings.passive
      });
    }
  }, {
    key: "setZoomImageURL",
    value: function setZoomImageURL(imageURL) {
      this.zoomPane._setImageURL(imageURL);
    }
  }, {
    key: "disable",
    value: function disable() {
      this.trigger.enabled = false;
    }
  }, {
    key: "enable",
    value: function enable() {
      this.trigger.enabled = true;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.trigger._hide();

      this.trigger._unbindEvents();
    }
  }, {
    key: "isShowing",
    get: function get() {
      return this.zoomPane.isShowing;
    }
  }, {
    key: "zoomFactor",
    get: function get() {
      return this.settings.zoomFactor;
    },
    set: function set(zf) {
      this.settings.zoomFactor = zf;
      this.zoomPane.settings.zoomFactor = zf;
      this.trigger.settings.zoomFactor = zf;
      this.boundingBox.settings.zoomFactor = zf;
    }
  }]);

  return Drift;
}(); // Public API
Object.defineProperty(Drift.prototype, "isShowing", {
  get: function get() {
    return this.isShowing;
  }
});
Object.defineProperty(Drift.prototype, "zoomFactor", {
  get: function get() {
    return this.zoomFactor;
  },
  set: function set(value) {
    this.zoomFactor = value;
  }
});
Drift.prototype["setZoomImageURL"] = Drift.prototype.setZoomImageURL;
Drift.prototype["disable"] = Drift.prototype.disable;
Drift.prototype["enable"] = Drift.prototype.enable;
Drift.prototype["destroy"] = Drift.prototype.destroy;
/* eslint-enable no-self-assign */

export { Drift, Drift as default };
