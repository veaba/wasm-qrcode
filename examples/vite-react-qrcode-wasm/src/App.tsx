import { useState, useEffect } from 'react';
import initWasm, { QRCodeCore, QRErrorCorrectLevel } from '@veaba/qrcode-wasm';

import './App.css';

function App() {
  const [svgStr, setSvgStr] = useState('');

  useEffect(() => {
    const generateQRCode = async () => {
      await initWasm();
      const qr = new QRCodeCore('https://github.com/veaba/qrcodes/setting', QRErrorCorrectLevel.H);
      const svg = qr.toSVG(256);

      setSvgStr(svg);
    };
    generateQRCode();
  }, []);

  return (
    <>
      <h1>Vite + React</h1>
      <div className='card'>
        <h2> vite + react + @veaba/qrcode-wasm</h2>
        <div dangerouslySetInnerHTML={{ __html: svgStr }} />
      </div>
    </>
  );
}

export default App;
