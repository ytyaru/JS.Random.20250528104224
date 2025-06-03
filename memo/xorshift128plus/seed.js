(function(){
Object.defineProperty(String, 'Base64', {get(){return [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/']}})
//Object.defineProperty(String, 'Base64URL', {get(){return [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_']}})
Object.defineProperty(String, 'Base64URL', {get(){return [...String.Base64.slice(0,62), ...'-_']}})
Object.defineProperty(String, 'Base256', {get(){return [...'⠀⢀⠠⢠⠐⢐⠰⢰⠈⢈⠨⢨⠘⢘⠸⢸⡀⣀⡠⣠⡐⣐⡰⣰⡈⣈⡨⣨⡘⣘⡸⣸⠄⢄⠤⢤⠔⢔⠴⢴⠌⢌⠬⢬⠜⢜⠼⢼⡄⣄⡤⣤⡔⣔⡴⣴⡌⣌⡬⣬⡜⣜⡼⣼⠂⢂⠢⢢⠒⢒⠲⢲⠊⢊⠪⢪⠚⢚⠺⢺⡂⣂⡢⣢⡒⣒⡲⣲⡊⣊⡪⣪⡚⣚⡺⣺⠆⢆⠦⢦⠖⢖⠶⢶⠎⢎⠮⢮⠞⢞⠾⢾⡆⣆⡦⣦⡖⣖⡶⣶⡎⣎⡮⣮⡞⣞⡾⣾⠁⢁⠡⢡⠑⢑⠱⢱⠉⢉⠩⢩⠙⢙⠹⢹⡁⣁⡡⣡⡑⣑⡱⣱⡉⣉⡩⣩⡙⣙⡹⣹⠅⢅⠥⢥⠕⢕⠵⢵⠍⢍⠭⢭⠝⢝⠽⢽⡅⣅⡥⣥⡕⣕⡵⣵⡍⣍⡭⣭⡝⣝⡽⣽⠃⢃⠣⢣⠓⢓⠳⢳⠋⢋⠫⢫⠛⢛⠻⢻⡃⣃⡣⣣⡓⣓⡳⣳⡋⣋⡫⣫⡛⣛⡻⣻⠇⢇⠧⢧⠗⢗⠷⢷⠏⢏⠯⢯⠟⢟⠿⢿⡇⣇⡧⣧⡗⣗⡷⣷⡏⣏⡯⣯⡟⣟⡿⣿']}})
String.getBaseChars = function(b) {
    switch (b) {
        case 2:
        case 4:
        case 8:
        case 10:
        case 16:
        case 32:
        case 36:
        case 64: return String.Base64URL.slice(0, b)
        case 256: return String.Base256
        default: throw new TypeError(`引数は2,4,8,10,16,32,36,64,256のいずれかであるべきです。`);
    }
}
Number.getFigureValuesOfBase = function(N,B,A) {// N:数, B:基数, A:各桁の値を0〜B-1の値でセットした配列
    if (undefined===A) {A = []}
    const Q = Math.floor(N / B); // 商
    const R = N % B; // 余り
    A.push(R);
    if (0===Q) {A.reverse()}
    return 0===Q ? A : Number.getFigureValuesOfBase(Q,B,A)
}
class Fig32 {// u32を各基数で表記した時の桁数Map
    constructor() {
        // [基数,桁数] 桁数は計算済み(Number.getFigureValuesOfBase().length)
        this._figs = new Map([[10,10],[16,8],[32,7],[36,7],[64,6],[256,4]]); 
    }
    get map() {return this._figs}
    get(base) {
        if (!(Number.isSafeInteger(base) && 2<=base && base<2**32)) {throw new TypeError(`引数baseは2以上2^32未満の整数であるべきです。`)}
        if (this._figs.has(base)) {return this._figs.get(base)}
        else {
            const fig = Number.getFigureValuesOfBase(2**32-1, base).length;
            this._figs.set(base, fig);
            return fig;
        }
    }
}
const fig32 = new Fig32();

class Cell32 {// 0〜2³²-1 | 0〜4294967295
    constructor() {
        this._bitSize = 32;
        // [基数,桁数] 桁数は計算済み(Number.getFigureValuesOfBase().length)
        this._figs = new Map([[10,10],[16,8],[32,7],[36,7],[64,6],[256,4]]); 
    }
    get bitSize() {return this._bitSize}
//    get figs() {return this._figs}
//    getFigs(base){return this.#getFig(base)}
    get fig() {return fig32}

    //getFigs(v, base){return Number.getFigureValuesOfBase(v, base)}
    s10(v){return this.toString(v,10)}   // 10桁 0〜9
    s16(v){return this.toString(v,16)}   //  8桁 0〜F
    s32(v){return this.toString(v,32)}   //  7桁 0〜V
    s36(v){return this.toString(v,36)}   //  7桁 0〜Z
    s64(v){return this.toString(v,64)}   //  6桁 0〜+
    s256(v){return this.toString(v,256)} //  4桁 ⠀〜⣿
    toString(u32, base) {
        const chars = String.getBaseChars(base);
        return Number.getFigureValuesOfBase(u32, base)
                .map(i=>chars[i]).join('')
                .padStart(this.fig.get(base), 256===base ? '⠀' : '0');
//                .padStart(this.getFigs(base), 256===base ? '⠀' : '0');
    }
    #getFig(base) {
        if (!(Number.isSafeInteger(base) && 2<=base && base<2**32)) {throw new TypeError(`引数baseは2以上2^32未満の整数であるべきです。`)}
        if (this._figs.has(base)) {return this._figs.get(base)}
        else {
            const fig = Number.getFigureValuesOfBase(2**32-1, base).length;
            this._figs.set(base, fig);
            return fig;
        }
    }
    //toString(u32, base) {return String.getBaseChars(base)[this.figs(u32, base)]}
    //toString(v, base) {return String.getBaseChars(base)[Number.calcBaseValues(v, base)]}
    /*
//    get s10() {return this.toString(10)}   // 10桁
//    get s16() {return this.toString(16)}   //  8桁
//    get s32() {return this.toString(32)}   //  7桁
//    get s64() {return this.toString(64)}   //  6桁
//    get s256() {return this.toString(256)} //  4桁
    toString(v, base) {
        const v = Number.calcBaseValues(v, base);
        return String.getBaseChars(base)[v]
        //const vs = this.u32a.map(u=>Number.calcBaseValues(u, base));
        const vs = this.u32a.map(u=>;
        const chars = String.getBaseChars(base);
        return vs.map(v=>chars[v]).join('').padStart(this.#getFig(base), 256===base ? '⠀' : '0');
    }
    */
}

class Seed {
    static of(...args) {// u32がN個, F桁の文字列が1個, Uint32Arrayが1個, Seedインスタンスが1個
        args = [...args];
        if (0<args.length) {
            if (args.every(a=>Number.isInteger(a) && 0<=a) && !args.every(a=>a===0)) {
                return 
            }
            else if ('string'===typeof args[0]) {
                const chars = args[0].split(',');
                chars[0].length
                if (fig32.map.has(chars[0].length)) {
                    7===chars[0].length
                }
                [...fig32.map.keys()].some()
            }

        }
        if (0<args.length && args.every(a=>Number.isInteger(a) && 0<=a) && !args.every(a=>a===0)) {
            
        }
        else if ('string'===typeof args[0])
        else {throw new TypeError(`引数はN個のu32か、F桁の文字列が1個か、Uint32Arrayが1個か、Seedインスタンスが1個のみ有効です。`)}
            const S = new Seed();
        }
    }
    constructor(bitSize=128) {
        this._cell = new Cell32();
        if (0!==(bitSize%this._cell.bitSize)){throw new TypeError(`引数のbitSizeは${this._cell.bitSize}の整数倍であるべきです。`)}
        this._bitSize = bitSize;
        this._byteSize = Math.floor(bitSize / 8);
        this._length = Math.floor(bitSize / this._cell.bitSize);
        this._u32a = new Uint32Array(this._length);
        [...new Array(this._length)].map((v,i)=>this._u32a[i]=Math.random() * 2**32);
    }
    get u32a() {return this._u32a}
    set u32a(v) {
        
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return Math.floor(this._bitSize / 8)}
    get s10() {return this.toString(10)}   // 10桁
    get s16() {return this.toString(16)}   //  8桁
    get s32() {return this.toString(32)}   //  7桁
    get s36() {return this.toString(36)}   //  7桁
    get s64() {return this.toString(64)}   //  6桁
    get s256() {return this.toString(256)} //  4桁
    toString(base){return this._u32a.map(u32=>this._cell.toString(u32,base)).join('')}

    /*
    this._u32a.map(u=>this._cell.s10()
    get s10() {return this.toString(10)}   // 10桁
    get s16() {return this.toString(16)}   //  8桁
    get s32() {return this.toString(32)}   //  7桁
    get s64() {return this.toString(64)}   //  6桁
    get s256() {return this.toString(256)} //  4桁










    #getFig(base) {
        if (!(Number.isSafeInteger(base) && 2<=base && base<2**32)) {throw new TypeError(`引数baseは2以上2^32未満の整数であるべきです。`)}
        if (this._figs.has(base)) {return this._figs.get(base)}
        else {
            const fig = Number.getFigureValuesOfBase(2**32-1, base).length;
            this._figs.set(base, fig);
            return fig;
        }
    }





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
    get s64() {// 64進数 Base64URL
//        padStart(6,'0')
//        return this.u32a.map(u=>u.toString(16).padStart(8,'0')).join(',')
        const vs = this.u32a.map(u=>Number.calcBaseValues(u, 64));
        const chars = String.Base64URL;
        return vs.map(v=>chars[v]).join('').padStart(6,'0');
    }
    get s256() {// 256進数 点字
        const vs = this.u32a.map(u=>Number.calcBaseValues(u, 64));
        const chars = String.Base256;
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
    */
}








/*
class Cell32 {// 0〜2³²-1 | 0〜4294967295
    constructor() {
        this._bitSize = 32;
        this._figs = null;
        this._figs = new Map([10,10],[16,8],[32,7],[64,6],[256,4]);
    }
    #getFig(base) {
        if (!(Number.isSafeInteger(base) && 2<=base && base<2**32)) {throw new TypeError(`引数baseは2以上2^32未満の整数であるべきです。`)}
        if (this._figs.has(base)) {return this._figs.get(base)}
        else {
            const fig = Number.getFigureValuesOfBase(2**32-1, base).length;
            this._figs.set(base, fig);
            return fig;
        }
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
    get s32() {// 32進数 Base64
        const vs = this.u32a.map(u=>Number.calcBaseValues(u, 32));
        const chars = String.Base64;
        return vs.map(v=>chars[v]).join('').padStart(6,'0');
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

    get s10() {return this.toString(10)}   // 10桁
    get s16() {return this.toString(16)}   //  8桁
    get s32() {return this.toString(32)}   //  7桁
    get s64() {return this.toString(64)}   //  6桁
    get s256() {return this.toString(256)} //  4桁
    toString(base) {
        const vs = this.u32a.map(u=>Number.calcBaseValues(u, base));
        const chars = String.getBaseChars(base);
        return vs.map(v=>chars[v]).join('').padStart(this.#getFig(base),'0');
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
*/
window.Seed = Seed;
})();

