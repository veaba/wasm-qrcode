const svgDrawer = () => {
  let Drawing = function (el, htOption) {
    this._el = el;
    this._htOption = htOption;
  };

  Drawing.prototype.draw = function (oQRCode) {
    let _htOption = this._htOption;
    let _el = this._el;
    let nCount = oQRCode.getModuleCount();
    let nWidth = Math.floor(_htOption.width / nCount);
    let nHeight = Math.floor(_htOption.height / nCount);

    this.clear();

    function makeSVG(tag, attrs) {
      let el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (let k in attrs)
        if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
      return el;
    }

    let svg = makeSVG('svg', {
      viewBox: '0 0 ' + String(nCount) + ' ' + String(nCount),
      width: '100%',
      height: '100%',
      fill: _htOption.colorLight,
    });
    svg.setAttributeNS(
      'http://www.w3.org/2000/xmlns/',
      'xmlns:xlink',
      'http://www.w3.org/1999/xlink'
    );
    _el.appendChild(svg);

    svg.appendChild(
      makeSVG('rect', {
        fill: _htOption.colorLight,
        width: '100%',
        height: '100%',
      })
    );
    svg.appendChild(
      makeSVG('rect', {
        fill: _htOption.colorDark,
        width: '1',
        height: '1',
        id: 'template',
      })
    );

    for (let row = 0; row < nCount; row++) {
      for (let col = 0; col < nCount; col++) {
        if (oQRCode.isDark(row, col)) {
          let child = makeSVG('use', { x: String(col), y: String(row) });
          child.setAttributeNS(
            'http://www.w3.org/1999/xlink',
            'href',
            '#template'
          );
          svg.appendChild(child);
        }
      }
    }
  };
  Drawing.prototype.clear = function () {
    while (this._el.hasChildNodes()) this._el.removeChild(this._el.lastChild);
  };
  return Drawing;
};
export default svgDrawer;
