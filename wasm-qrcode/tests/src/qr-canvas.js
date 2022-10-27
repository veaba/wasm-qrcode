// Drawing in Canvas

export default useCanvas = () => {
  function _onMakeImage() {
    this._elImage.src = this._elCanvas.toDataURL('image/png');
    this._elImage.style.display = 'block';
    this._elCanvas.style.display = 'none';
  }

  // Android 2.1 bug workaround
  // http://code.google.com/p/android/issues/detail?id=5141
  if (this._android && this._android <= 2.1) {
    let factor = 1 / window.devicePixelRatio;
    let drawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (
      image,
      sx,
      sy,
      sw,
      sh,
      dx,
      dy,
      dw,
      dh
    ) {
      if ('nodeName' in image && /img/i.test(image.nodeName)) {
        for (let i = arguments.length - 1; i >= 1; i--) {
          arguments[i] = arguments[i] * factor;
        }
      } else if (typeof dw === 'undefined') {
        arguments[1] *= factor;
        arguments[2] *= factor;
        arguments[3] *= factor;
        arguments[4] *= factor;
      }

      drawImage.apply(this, arguments);
    };
  }

  /**
   * Check whether the user's browser supports Data URI or not
   *
   * @private
   * @param {Function} fSuccess Occurs if it supports Data URI
   * @param {Function} fFail Occurs if it doesn't support Data URI
   */
  function _safeSetDataURI(fSuccess, fFail) {
    let self = this;
    self._fFail = fFail;
    self._fSuccess = fSuccess;

    // Check it just once
    if (self._bSupportDataURI === null) {
      let el = document.createElement('img');
      let fOnError = function () {
        self._bSupportDataURI = false;

        if (self._fFail) {
          self._fFail.call(self);
        }
      };
      let fOnSuccess = function () {
        self._bSupportDataURI = true;

        if (self._fSuccess) {
          self._fSuccess.call(self);
        }
      };

      el.onabort = fOnError;
      el.onerror = fOnError;
      el.onload = fOnSuccess;
      el.src =
        'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='; // the Image contains 1px data.
      return;
    } else if (self._bSupportDataURI === true && self._fSuccess) {
      self._fSuccess.call(self);
    } else if (self._bSupportDataURI === false && self._fFail) {
      self._fFail.call(self);
    }
  }
};
