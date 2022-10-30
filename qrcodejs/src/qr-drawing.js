import { _getAndroid } from './shared/utils';
import { _safeSetDataURI, _onMakeImage } from './qr-canvas';
/**
 * Drawing QRCode by using canvas
 *
 * @constructor
 * @param {HTMLElement} el
 * @param {Object} htOption QRCode Options
 */
let Drawing = function (el, htOption) {
  this._bIsPainted = false;
  this._android = _getAndroid();

  this._htOption = htOption;
  this._elCanvas = document.createElement('canvas');
  this._elCanvas.width = htOption.width;
  this._elCanvas.height = htOption.height;
  el.appendChild(this._elCanvas);
  this._el = el;
  this._oContext = this._elCanvas.getContext('2d');
  this._bIsPainted = false;
  this._elImage = document.createElement('img');
  this._elImage.alt = 'Scan me!';
  this._elImage.style.display = 'none';
  this._el.appendChild(this._elImage);
  this._bSupportDataURI = null;
};

/**
 * Draw the QRCode
 *
 * @param {QRCode} oQRCode
 */
Drawing.prototype.draw = function (oQRCode) {
  let _elImage = this._elImage;
  let _oContext = this._oContext;
  let _htOption = this._htOption;

  let nCount = oQRCode.getModuleCount();
  let nWidth = _htOption.width / nCount;
  let nHeight = _htOption.height / nCount;
  let nRoundedWidth = Math.round(nWidth);
  let nRoundedHeight = Math.round(nHeight);

  _elImage.style.display = 'none';
  this.clear();

  console.log('nCount=>',nCount)
  for (let row = 0; row < nCount; row++) {
    for (let col = 0; col < nCount; col++) {
      let bIsDark = oQRCode.isDark(row, col);
      let nLeft = col * nWidth;
      let nTop = row * nHeight;
    
      _oContext.strokeStyle = bIsDark
        ? _htOption.colorDark
        : _htOption.colorLight;
      _oContext.lineWidth = 1;
      _oContext.fillStyle = bIsDark
        ? _htOption.colorDark
        : _htOption.colorLight;
      // console.log('_oContext.strokeStyle=>',_oContext.strokeStyle)
      // console.log('_oContext.fillStyle=>',_oContext.fillStyle)
      // console.log(
      //   // 'nLeft, nTop, nWidth, nHeight=>',
      //   nLeft,
      //   nTop,
      //   nWidth,
      //   nHeight
      // );
      _oContext.fillRect(nLeft, nTop, nWidth, nHeight);

      // 안티 앨리어싱 방지 처리
      _oContext.strokeRect(
        Math.floor(nLeft) + 0.5,
        Math.floor(nTop) + 0.5,
        nRoundedWidth,
        nRoundedHeight
      );

      _oContext.strokeRect(
        Math.ceil(nLeft) - 0.5,
        Math.ceil(nTop) - 0.5,
        nRoundedWidth,
        nRoundedHeight
      );
    }
  }

  this._bIsPainted = true;
};

/**
 * Make the image from Canvas if the browser supports Data URI.
 */
Drawing.prototype.makeImage = function () {
  if (this._bIsPainted) {
    _safeSetDataURI.call(this, _onMakeImage);
  }
};

/**
 * Return whether the QRCode is painted or not
 *
 * @return {Boolean}
 */
Drawing.prototype.isPainted = function () {
  return this._bIsPainted;
};

/**
 * Clear the QRCode
 */
Drawing.prototype.clear = function () {
  this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
  this._bIsPainted = false;
};

/**
 * @private
 * @param {Number} nNumber
 */
Drawing.prototype.round = function (nNumber) {
  if (!nNumber) {
    return nNumber;
  }

  return Math.floor(nNumber * 1000) / 1000;
};

export default Drawing;
