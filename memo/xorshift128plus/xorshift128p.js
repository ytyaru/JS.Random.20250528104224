(function(){
class Cell {
    constructor(bitSize=32, length=1) {
        if (0!==(bitSize%this._cellSize)){throw new TypeError(`引数のbitSizeは32の整数倍であるべきです。`)}
        if (!(Number.isSafeInteger(length) && 0<length)){throw new TypeError(`引数のlengthは自然数であるべきです。`)}
        this._bitSize = bitSize;
        this._length = length;
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return Math.floor(this._bitSize / 8)}
    get length() {return this._length}
}

個数:42億
0〜個数-1

LEN
MIN
MAX

class Cell32 extends Cell {constructor(length=1) {super(32, length)}

Object.defineProperty(String, 'Base64', {get(){return [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_+']}})
Object.defineProperty(String, 'Base256', {get(){return [...'⠀⢀⠠⢠⠐⢐⠰⢰⠈⢈⠨⢨⠘⢘⠸⢸⡀⣀⡠⣠⡐⣐⡰⣰⡈⣈⡨⣨⡘⣘⡸⣸⠄⢄⠤⢤⠔⢔⠴⢴⠌⢌⠬⢬⠜⢜⠼⢼⡄⣄⡤⣤⡔⣔⡴⣴⡌⣌⡬⣬⡜⣜⡼⣼⠂⢂⠢⢢⠒⢒⠲⢲⠊⢊⠪⢪⠚⢚⠺⢺⡂⣂⡢⣢⡒⣒⡲⣲⡊⣊⡪⣪⡚⣚⡺⣺⠆⢆⠦⢦⠖⢖⠶⢶⠎⢎⠮⢮⠞⢞⠾⢾⡆⣆⡦⣦⡖⣖⡶⣶⡎⣎⡮⣮⡞⣞⡾⣾⠁⢁⠡⢡⠑⢑⠱⢱⠉⢉⠩⢩⠙⢙⠹⢹⡁⣁⡡⣡⡑⣑⡱⣱⡉⣉⡩⣩⡙⣙⡹⣹⠅⢅⠥⢥⠕⢕⠵⢵⠍⢍⠭⢭⠝⢝⠽⢽⡅⣅⡥⣥⡕⣕⡵⣵⡍⣍⡭⣭⡝⣝⡽⣽⠃⢃⠣⢣⠓⢓⠳⢳⠋⢋⠫⢫⠛⢛⠻⢻⡃⣃⡣⣣⡓⣓⡳⣳⡋⣋⡫⣫⡛⣛⡻⣻⠇⢇⠧⢧⠗⢗⠷⢷⠏⢏⠯⢯⠟⢟⠿⢿⡇⣇⡧⣧⡗⣗⡷⣷⡏⣏⡯⣯⡟⣟⡿⣿']}})
//String.Base64 = [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_+'];
//String.Base256 = [...'⠀⢀⠠⢠⠐⢐⠰⢰⠈⢈⠨⢨⠘⢘⠸⢸⡀⣀⡠⣠⡐⣐⡰⣰⡈⣈⡨⣨⡘⣘⡸⣸⠄⢄⠤⢤⠔⢔⠴⢴⠌⢌⠬⢬⠜⢜⠼⢼⡄⣄⡤⣤⡔⣔⡴⣴⡌⣌⡬⣬⡜⣜⡼⣼⠂⢂⠢⢢⠒⢒⠲⢲⠊⢊⠪⢪⠚⢚⠺⢺⡂⣂⡢⣢⡒⣒⡲⣲⡊⣊⡪⣪⡚⣚⡺⣺⠆⢆⠦⢦⠖⢖⠶⢶⠎⢎⠮⢮⠞⢞⠾⢾⡆⣆⡦⣦⡖⣖⡶⣶⡎⣎⡮⣮⡞⣞⡾⣾⠁⢁⠡⢡⠑⢑⠱⢱⠉⢉⠩⢩⠙⢙⠹⢹⡁⣁⡡⣡⡑⣑⡱⣱⡉⣉⡩⣩⡙⣙⡹⣹⠅⢅⠥⢥⠕⢕⠵⢵⠍⢍⠭⢭⠝⢝⠽⢽⡅⣅⡥⣥⡕⣕⡵⣵⡍⣍⡭⣭⡝⣝⡽⣽⠃⢃⠣⢣⠓⢓⠳⢳⠋⢋⠫⢫⠛⢛⠻⢻⡃⣃⡣⣣⡓⣓⡳⣳⡋⣋⡫⣫⡛⣛⡻⣻⠇⢇⠧⢧⠗⢗⠷⢷⠏⢏⠯⢯⠟⢟⠿⢿⡇⣇⡧⣧⡗⣗⡷⣷⡏⣏⡯⣯⡟⣟⡿⣿'];
String.getBaseChars = function(b) {
    switch (b) {
        case 2:
        case 4:
        case 8:
        case 10:
        case 16:
        case 32:
        case 36:
        case 64: return String.Base64.slice(b)
        case 256: return String.Base256
        default: throw new TypeError(`引数は2,4,8,10,16,32,36,64,256のいずれかであるべきです。`);
    }
}
/*
function calcBase(N,B,A) {// N:数, B:基数, A:各桁の値を0〜B-1の値でセットした配列
    if (undefined===A) {A = []}
    const Q = Math.floor(N / B); // 商
    const R = N % B; // 余り
    A.push(R);
    if (0===Q) {A.reverse()}
    return 0===Q ? A : calcBase(Q,B,A)
}
*/
Number.getFigureValuesOfBase = function(N,B,A) {// N:数, B:基数, A:各桁の値を0〜B-1の値でセットした配列
    if (undefined===A) {A = []}
    const Q = Math.floor(N / B); // 商
    const R = N % B; // 余り
    A.push(R);
    if (0===Q) {A.reverse()}
    return 0===Q ? A : calcBase(Q,B,A)
}
class Base64 {
    toStr(num) {
        if (num<0) {throw new TypeError(`引数numは0以上であるべきです。`)}
        if (num === 0) {return chars[0];}
        const chars = String.Base64;
        if (num < 64) {return chars[num]}
        let result = '';
        let t = num;
        while (t > 0) {
            result = chars[t % 64] + result;
            t = Math.floor(t / 64);
        }
        return result;
    }
    toNum(str) {

    }
}
function toBase64(num) {
  // 64進数で使用する文字セット
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
}

class Cell32 {
    constructor() {
        this._bitSize = 32;
        this._figs = [10,16,64,256].map(b=>Number.getFigureValuesOfBase(2**32-1, b).length); // [10,8,6,4]
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return Math.floor(this._bitSize / 8)}
    get s10() {
this._figs[0]
        padStart(10,'0')
        const Cs = String.getBaseChars(b);
        //return this.u32a.map(u=>u.toString().padStart(10,'0')).join(',')
        return this.u32a.map(u=>u.toString().padStart(this._figs[0],'0')).join(',')

    }
    // bitSizeが53以上だとNumber型で表現できないので文字列型にする。この時16/64/256進数にてそれぞれの文字を使って表現する。bitSizeが32の時、桁数はそれぞれ16:8, 64:6, 256:4 桁。128の時は32,24,16桁。
    get s16() {// 16進数 
        // '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_+'
        padStart(8,'0')
        //return this.u32a.map(u=>u.toString(16).padStart(8,'0')).join(',')
        return this.u32a.map(u=>u.toString(16).padStart(this._figs[0],'0')).join(',')

    }
    get s64() {// 64進数 Base64
//        padStart(6,'0')
//        return this.u32a.map(u=>u.toString(16).padStart(8,'0')).join(',')
        const vs = this.u32a.map(u=>Number.calcBaseValues(u, 64));
        const chars = String.Base64;
        return vs.map(v=>chars[v]).join('').padStart(6,'0');
    }
    get s256() {// 256進数 点字
        const vs = this.u32a.map(u=>Number.calcBaseValues(u, 64));
        const chars = String.Base64;
        return vs.map(v=>chars[v]).join('').padStart(4,'0');
    }

}


class Seed {
    constructor(bitSize=128) {
        this._cell = new Cell32(Math.floor(bitSize/32));






        this._cellSize = 32;
        if (0!==(bitSize%this._cellSize)){throw new TypeError(`引数のbitSizeは32の整数倍であるべきです。`)}
        this._cellLength = Math.floor(bitSize/this._cellSize);
        this._L = 2**this._cellSize-1; // 4294967296-1
        this._bitSize = bitSize;
        //this._byteSize = this._bitSize / 8;
        //this._a = new Uint32Array(this._byteSize);
        this._u32a = new Uint32Array(this._cellLength);
        this._cellFs = [16,64,256].map(B=>this.#calcBase(this._L, B).length * this._cellLength)
        this._Fs = [16,64,256].map(B=>); // 最大桁数(uint32の最大値を各進数で表記した時の桁数)
    }
    get u32a() {return this._a}
    get bitSize() {return this._bitSize}
    get byteSize() {return this._bitSize}
    //get s10() {return this.u32a.map(u=>u.toString(10)).join(',')}
    get s10() {
        padStart(10,'0')
        const Cs = String.getBaseChars(b);
        return this.u32a.map(u=>u.toString().padStart(10,'0')).join(',')
    }
    // bitSizeが53以上だとNumber型で表現できないので文字列型にする。この時16/64/256進数にてそれぞれの文字を使って表現する。bitSizeが32の時、桁数はそれぞれ16:8, 64:6, 256:4 桁。128の時は32,24,16桁。
    get s16() {// 16進数 
        // '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_+'
        padStart(8,'0')
        return this.u32a.map(u=>u.toString(16).padStart(8,'0')).join(',')

    }
    get s64() {// 64進数 Base64
//        padStart(6,'0')
//        return this.u32a.map(u=>u.toString(16).padStart(8,'0')).join(',')
        const vs = this.u32a.map(u=>Number.calcBaseValues(u, 64));
        const chars = String.Base64;
        return vs.map(v=>chars[v]).join('').padStart(6,'0');
    }
    get s256() {// 256進数 点字
        const vs = this.u32a.map(u=>Number.calcBaseValues(u, 64));
        const chars = String.Base64;
        return vs.map(v=>chars[v]).join('').padStart(4,'0');
    }
    #calcBase(N,B,A) {// N:数, B:基数, A:各桁の値を0〜B-1の値でセットした配列
        if (undefined===A) {A = []}
        const Q = Math.floor(N / B); // 商
        const R = N % B; // 余り
        A.push(R);
        if (0===Q) {A.reverse()}
        return 0===Q ? A : this.#calcBase(Q,B,A)
    }
}
class Xorshift128p {// PRNG.XorShift128+ 疑似乱数生成器
    constructor(...args) {
        if (0===args.length) {// 引数なし。シード値をランダム生成する。
            this._seed = new Uint32Array(this._byteSize);
            [...new Array(4)].map((v,i)=>this._seed[i]=Math.floor(Math.random()*Math.pow(2,32)));
        }
        // 引数1個文字列型。16進数表記(32桁)
        else if (1===args.length && ('string'===typeof args[0] || args[0] instanceof String) && 32===args[0].length) {
            
          const buffer = new ArrayBuffer(16)
          const view = new Buffer(buffer)
          view.write(seed, 'hex')
        }
        // 引数1個文字列型。64進数表記(32桁)
        else if () {

        }
        // 引数1個文字列型。256進数表記(16桁)
        else if () {

        }
    }
  return new XorShift128Plus(buffer)
        }
//    constructor(seed) {
        this._seed = new Uint32Array(4);
        [...new Array(4)].map((v,i)=>this._seed[i]=Math.floor(Math.random()*Math.pow(2,32)));

        this._byteSize = 4;
        this._seed = new Uint32Array(this._byteSize);
        [...new Array(this._byteSize)]this._seed
    }
}
})();

