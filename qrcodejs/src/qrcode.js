/**
 * 完全重写的 QRCode 实现
 * 使用现代 JavaScript 和正确的 Reed-Solomon 算法
 */

// Galois Field 数学运算
const QRMath = {
  glog(n) {
    if (n < 1) throw new Error(`glog(${n})`);
    return QRMath.LOG_TABLE[n];
  },
  gexp(n) {
    while (n < 0) n += 255;
    while (n >= 256) n -= 255;
    return QRMath.EXP_TABLE[n];
  },
  EXP_TABLE: new Array(256),
  LOG_TABLE: new Array(256)
};

// 初始化 Galois Field 表
for (let i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
for (let i = 8; i < 256; i++) {
  QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ 
                        QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
}
for (let i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;

// 多项式类
class Polynomial {
  constructor(coeffs) {
    // 去除前导零
    let start = 0;
    while (start < coeffs.length - 1 && coeffs[start] === 0) start++;
    this.coeffs = coeffs.slice(start);
  }
  
  get length() { return this.coeffs.length; }
  get(i) { return this.coeffs[i]; }
  
  multiply(other) {
    const result = new Array(this.length + other.length - 1).fill(0);
    for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < other.length; j++) {
        result[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(other.get(j)));
      }
    }
    return new Polynomial(result);
  }
  
  // 取模运算
  mod(e) {
    if (this.length - e.length < 0) {
      return this;
    }
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    const num = [...this.coeffs];
    for (let i = 0; i < e.length; i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    }
    return new Polynomial(num).mod(e);
  }
}

// 获取错误纠正多项式
function getErrorCorrectPolynomial(ecCount) {
  let poly = new Polynomial([1]);
  for (let i = 0; i < ecCount; i++) {
    poly = poly.multiply(new Polynomial([1, QRMath.gexp(i)]));
  }
  return poly;
}

// QRCode 模式
const QRMode = { MODE_8BIT_BYTE: 4 };
export const QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };

// 位置调整图案位置表
const PATTERN_POSITION_TABLE = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

// 容量表
const QRCodeLimitLength = [
  [17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24],
  [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58],
  [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98],
  [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155],
  [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220],
  [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310],
  [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403],
  [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511],
  [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625],
  [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742],
  [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898],
  [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051],
  [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219],
  [2953, 2331, 1663, 1273]
];

// RS 块表
const RS_BLOCK_TABLE = [
  [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],
  [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],
  [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],
  [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],
  [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],
  [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],
  [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],
  [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],
  [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],
  [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],
  [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13],
  [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15],
  [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12],
  [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13],
  [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12],
  [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16],
  [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15],
  [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15],
  [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14],
  [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16],
  [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17],
  [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13],
  [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16],
  [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17],
  [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16],
  [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17],
  [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16],
  [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16],
  [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16],
  [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16],
  [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16],
  [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16],
  [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16],
  [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17],
  [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16],
  [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16],
  [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16],
  [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16],
  [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16],
  [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]
];

function getRSBlocks(typeNumber, errorCorrectLevel) {
  // 将 errorCorrectLevel 映射到 RS_BLOCK_TABLE 的索引
  // QRErrorCorrectLevel: L=1, M=0, Q=3, H=2
  // RS_BLOCK_TABLE 顺序: L=0, M=1, Q=2, H=3
  const levelMap = { 1: 0, 0: 1, 3: 2, 2: 3 };
  const index = (typeNumber - 1) * 4 + levelMap[errorCorrectLevel];
  const rsBlock = RS_BLOCK_TABLE[index] || RS_BLOCK_TABLE[0];
  const list = [];
  const length = Math.floor(rsBlock.length / 3);
  for (let i = 0; i < length; i++) {
    const count = rsBlock[i * 3];
    const totalCount = rsBlock[i * 3 + 1];
    const dataCount = rsBlock[i * 3 + 2];
    for (let j = 0; j < count; j++) {
      list.push({ totalCount, dataCount });
    }
  }
  return list;
}

function getTypeNumber(text, correctLevel) {
  let type = 1;
  const length = new TextEncoder().encode(text).length;
  // 将 errorCorrectLevel 映射到 QRCodeLimitLength 的索引
  // QRErrorCorrectLevel: L=1, M=0, Q=3, H=2
  // QRCodeLimitLength 顺序: L=0, M=1, Q=2, H=3
  const levelMap = { 1: 0, 0: 1, 3: 2, 2: 3 };
  for (let i = 0; i < QRCodeLimitLength.length; i++) {
    const limit = QRCodeLimitLength[i][levelMap[correctLevel]];
    if (length <= limit) break;
    type++;
  }
  return type;
}

// 位缓冲区
class BitBuffer {
  constructor() {
    this.buffer = [];
    this.length = 0;
  }
  put(num, length) {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }
  putBit(bit) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) this.buffer.push(0);
    if (bit) this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    this.length++;
  }
}

// 主 QRCode 类
export class QRCode {
  constructor(text, correctLevel = QRErrorCorrectLevel.H) {
    this.text = text;
    this.correctLevel = correctLevel;
    this.typeNumber = getTypeNumber(text, correctLevel);
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = Array(this.moduleCount).fill(null).map(() => Array(this.moduleCount).fill(null));
    this.make();
  }
  
  isDark(row, col) {
    return this.modules[row][col] || false;
  }
  
  make() {
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo();
    if (this.typeNumber >= 7) this.setupTypeNumber();
    this.mapData();
  }
  
  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        const isDark = (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
                       (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                       (2 <= r && r <= 4 && 2 <= c && c <= 4);
        this.modules[row + r][col + c] = isDark;
      }
    }
  }
  
  setupPositionAdjustPattern() {
    const pos = PATTERN_POSITION_TABLE[this.typeNumber - 1];
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i];
        const col = pos[j];
        if (this.modules[row][col] !== null) {
          continue;
        }
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            this.modules[row + r][col + c] =
              r === -2 ||
              r === 2 ||
              c === -2 ||
              c === 2 ||
              (r === 0 && c === 0);
          }
        }
      }
    }
  }
  
  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] === null) this.modules[r][6] = r % 2 === 0;
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] === null) this.modules[6][c] = c % 2 === 0;
    }
  }
  
  setupTypeInfo() {
    // 计算类型信息（15位）
    // 格式: 2位错误纠正级别 + 3位遮罩模式 + 10位 BCH 纠错码
    const g15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    const g15Mask = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
    
    // 使用遮罩模式 0
    const maskPattern = 0;
    let data = (this.correctLevel << 3) | maskPattern;
    let d = data << 10;
    
    // 计算 BCH 纠错码
    while (this.getBCHDigit(d) - this.getBCHDigit(g15) >= 0) {
      d ^= g15 << (this.getBCHDigit(d) - this.getBCHDigit(g15));
    }
    
    data = ((data << 10) | d) ^ g15Mask;
    
    // 写入类型信息到 QR 码
    // 左下角区域（第 8 列，从下往上）
    for (let i = 0; i < 15; i++) {
      const bit = (data >> i) & 1;
      const dark = bit === 1;
      
      if (i < 6) {
        this.modules[i][8] = dark;
      } else if (i < 8) {
        this.modules[i + 1][8] = dark;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = dark;
      }
    }
    
    // 顶部区域（第 8 行，从左往右）
    for (let i = 0; i < 15; i++) {
      const bit = (data >> i) & 1;
      const dark = bit === 1;
      
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = dark;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = dark;
      } else {
        this.modules[8][15 - i - 1] = dark;
      }
    }
    
    // 固定位置（始终为黑色）
    this.modules[this.moduleCount - 8][8] = true;
  }
  
  getBCHDigit(data) {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>= 1;
    }
    return digit;
  }
  
  setupTypeNumber() {
    // 简化版本
  }
  
  mapData() {
    // 创建数据
    const data = this.createData();
    
    // 映射数据到模块
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }
            // 应用遮罩
            if ((row + col - c) % 2 === 0) dark = !dark;
            this.modules[row][col - c] = dark;
            bitIndex--;
            if (bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }
  
  getLengthInBits(mode) {
    if (this.typeNumber >= 1 && this.typeNumber < 10) {
      return 8;
    } else if (this.typeNumber < 27) {
      return 16;
    } else {
      return 16;
    }
  }
  
  createData() {
    const rsBlocks = getRSBlocks(this.typeNumber, this.correctLevel);
    const buffer = new BitBuffer();
    
    // 添加模式指示符
    buffer.put(QRMode.MODE_8BIT_BYTE, 4);
    
    // 添加数据长度
    const textBytes = new TextEncoder().encode(this.text);
    buffer.put(textBytes.length, this.getLengthInBits(QRMode.MODE_8BIT_BYTE));
    
    // 添加数据
    for (const byte of textBytes) buffer.put(byte, 8);
    
    // 计算总数据容量
    let totalDataCount = 0;
    for (const block of rsBlocks) totalDataCount += block.dataCount;
    
    // 填充终止符和填充字节
    if (buffer.length + 4 <= totalDataCount * 8) buffer.put(0, 4);
    while (buffer.length % 8 !== 0) buffer.putBit(false);
    while (buffer.length < totalDataCount * 8) {
      buffer.put(0xEC, 8);
      if (buffer.length >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }
    
    // 计算错误纠正码
    const data = buffer.buffer;
    let offset = 0;
    const maxDcCount = Math.max(...rsBlocks.map(b => b.dataCount));
    const maxEcCount = Math.max(...rsBlocks.map(b => b.totalCount - b.dataCount));
    
    const dcdata = [];
    const ecdata = [];
    
    for (const block of rsBlocks) {
      const dcCount = block.dataCount;
      const ecCount = block.totalCount - dcCount;
      
      dcdata.push(data.slice(offset, offset + dcCount));
      offset += dcCount;
      
      // 使用新的多项式类计算错误纠正码
      const rsPoly = getErrorCorrectPolynomial(ecCount);
      const rawPoly = new Polynomial([...dcdata[dcdata.length - 1], ...new Array(ecCount).fill(0)]);
      const modPoly = rawPoly.mod(rsPoly);
      
      const ec = [];
      for (let i = 0; i < ecCount; i++) {
        const modIndex = i + modPoly.length - ecCount;
        ec.push(modIndex >= 0 ? modPoly.get(modIndex) : 0);
      }
      ecdata.push(ec);
    }
    
    // 合并数据
    const result = [];
    for (let i = 0; i < maxDcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) result.push(dcdata[r][i]);
      }
    }
    for (let i = 0; i < maxEcCount; i++) {
      for (let r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) result.push(ecdata[r][i]);
      }
    }
    
    return result;
  }
  
  // 生成 SVG（与 WASM 版本 API 一致）
  get_svg() {
    return this.toSVG(256);
  }
  
  // 生成 SVG（自定义尺寸）
  toSVG(size = 256) {
    const cellSize = Math.floor(size / this.moduleCount);
    const actualSize = cellSize * this.moduleCount;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${actualSize} ${actualSize}" width="${actualSize}" height="${actualSize}">`;
    svg += `<rect width="${actualSize}" height="${actualSize}" fill="white"/>`;
    
    for (let row = 0; row < this.moduleCount; row++) {
      for (let col = 0; col < this.moduleCount; col++) {
        if (this.isDark(row, col)) {
          svg += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }
    
    svg += '</svg>';
    return svg;
  }
  
  // 获取模块数量（与 WASM 版本 API 一致）
  get_module_count() {
    return this.moduleCount;
  }
  
  // 生成带样式的 SVG（与 WASM 版本一致）
  get_styled_svg(options = {}) {
    const {
      colorDark = '#000000',
      colorLight = '#ffffff',
      borderRadius = 0,
      gradient = null, // { color1, color2 }
      quietZone = 0
    } = options;
    
    const count = this.moduleCount;
    const totalCount = count + quietZone * 2;
    const size = 256;
    const cellSize = Math.floor(size / totalCount);
    const actualSize = cellSize * totalCount;
    const offset = (size - actualSize) / 2;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
    
    // 定义渐变
    if (gradient) {
      svg += `<defs>
        <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.color1}" />
          <stop offset="100%" style="stop-color:${gradient.color2}" />
        </linearGradient>
      </defs>`;
    }
    
    // 背景
    const bgRadius = Math.min(borderRadius, size / 8);
    svg += `<rect width="${size}" height="${size}" fill="${colorLight}" rx="${bgRadius}" ry="${bgRadius}"/>`;
    
    // 填充颜色
    const fillColor = gradient ? 'url(#qrGradient)' : colorDark;
    
    // 绘制模块
    const radius = Math.min(borderRadius, Math.floor(cellSize / 4));
    
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (this.isDark(row, col)) {
          const x = (col + quietZone) * cellSize + offset;
          const y = (row + quietZone) * cellSize + offset;
          
          if (radius > 0) {
            svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fillColor}" rx="${radius}" ry="${radius}"/>`;
          } else {
            svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fillColor}"/>`;
          }
        }
      }
    }
    
    svg += '</svg>';
    return svg;
  }
}

// ========== 样式化 QRCode 生成函数（与 WASM 版本 API 一致）==========

// 圆角样式
export function generate_rounded_qrcode(text, size = 256, radius = 8) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.get_styled_svg({
    borderRadius: radius,
    quietZone: 2
  });
}

// 带 Logo 区域
export function generate_qrcode_with_logo_area(text, size = 256, logoRatio = 0.2) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  const count = qr.get_module_count();
  const logoCells = Math.floor(count * logoRatio);
  const logoStart = Math.floor((count - logoCells) / 2);
  const logoEnd = logoStart + logoCells;
  
  // 重新生成，跳过 Logo 区域
  const totalCount = count + 4; // quietZone = 2
  const cellSize = Math.floor(size / totalCount);
  const actualSize = cellSize * totalCount;
  const offset = (size - actualSize) / 2;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  // 绘制二维码（跳过 Logo 区域）
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      // 跳过 Logo 区域
      if (row >= logoStart && row < logoEnd && col >= logoStart && col < logoEnd) {
        continue;
      }
      if (qr.isDark(row, col)) {
        const x = (col + 2) * cellSize + offset;
        const y = (row + 2) * cellSize + offset;
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }
  
  // 添加 Logo 占位框
  const logoX = (logoStart + 2) * cellSize + offset;
  const logoY = (logoStart + 2) * cellSize + offset;
  const logoSize = logoCells * cellSize;
  svg += `<rect x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" fill="white" stroke="#e0e0e0" stroke-width="2"/>`;
  
  svg += '</svg>';
  return svg;
}

// 渐变样式
export function generate_gradient_qrcode(text, size = 256, color1 = '#667eea', color2 = '#764ba2') {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.get_styled_svg({
    gradient: { color1, color2 },
    quietZone: 2
  });
}

// 微信样式
export function generate_wechat_style_qrcode(text, size = 256) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.get_styled_svg({
    colorDark: '#07C160',
    colorLight: '#ffffff',
    borderRadius: 4,
    quietZone: 2
  });
}

// 抖音样式
export function generate_douyin_style_qrcode(text, size = 256) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.get_styled_svg({
    colorDark: '#00F2EA',
    colorLight: '#000000',
    gradient: { color1: '#00F2EA', color2: '#FF0050' },
    borderRadius: 6,
    quietZone: 2
  });
}

// 支付宝样式
export function generate_alipay_style_qrcode(text, size = 256) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  // 使用带 Logo 区域的实现
  return generate_qrcode_with_logo_area(text, size, 0.15);
}

// 小红书样式
export function generate_xiaohongshu_style_qrcode(text, size = 256) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.get_styled_svg({
    colorDark: '#FF2442',
    colorLight: '#ffffff',
    borderRadius: 12,
    quietZone: 2
  });
}

// 赛博朋克样式
export function generate_cyberpunk_style_qrcode(text, size = 256) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.get_styled_svg({
    colorDark: '#FF00FF',
    colorLight: '#0a0a0a',
    gradient: { color1: '#FF00FF', color2: '#00FFFF' },
    borderRadius: 2,
    quietZone: 2
  });
}

// 复古样式
export function generate_retro_style_qrcode(text, size = 256) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.get_styled_svg({
    colorDark: '#8B4513',
    colorLight: '#F5F5DC',
    borderRadius: 0,
    quietZone: 2
  });
}

// 极简样式
export function generate_minimal_style_qrcode(text, size = 256) {
  const qr = new QRCode(text, QRErrorCorrectLevel.H);
  return qr.get_styled_svg({
    colorDark: '#333333',
    colorLight: '#fafafa',
    borderRadius: 16,
    quietZone: 2
  });
}

export default QRCode;
