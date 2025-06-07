(function(){
Object.defineProperty(String, 'Base64', {get(){return [...'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/']}})
Object.defineProperty(String, 'Base64URL', {get(){return [...String.Base64.slice(0,62), ...'-_']}})
Object.defineProperty(String, 'Base36', {get(){return [...String.Base64.slice(0,36)]}})
Object.defineProperty(String, 'Base32', {get(){return [...String.Base64.slice(0,32)]}})
Object.defineProperty(String, 'Base16', {get(){return [...String.Base64.slice(0,16)]}})
Object.defineProperty(String, 'Base10', {get(){return [...String.Base64.slice(0,10)]}})
Object.defineProperty(String, 'Base8', {get(){return [...String.Base64.slice(0,8)]}})
Object.defineProperty(String, 'Base256', {get(){return [...'⠀⢀⠠⢠⠐⢐⠰⢰⠈⢈⠨⢨⠘⢘⠸⢸⡀⣀⡠⣠⡐⣐⡰⣰⡈⣈⡨⣨⡘⣘⡸⣸⠄⢄⠤⢤⠔⢔⠴⢴⠌⢌⠬⢬⠜⢜⠼⢼⡄⣄⡤⣤⡔⣔⡴⣴⡌⣌⡬⣬⡜⣜⡼⣼⠂⢂⠢⢢⠒⢒⠲⢲⠊⢊⠪⢪⠚⢚⠺⢺⡂⣂⡢⣢⡒⣒⡲⣲⡊⣊⡪⣪⡚⣚⡺⣺⠆⢆⠦⢦⠖⢖⠶⢶⠎⢎⠮⢮⠞⢞⠾⢾⡆⣆⡦⣦⡖⣖⡶⣶⡎⣎⡮⣮⡞⣞⡾⣾⠁⢁⠡⢡⠑⢑⠱⢱⠉⢉⠩⢩⠙⢙⠹⢹⡁⣁⡡⣡⡑⣑⡱⣱⡉⣉⡩⣩⡙⣙⡹⣹⠅⢅⠥⢥⠕⢕⠵⢵⠍⢍⠭⢭⠝⢝⠽⢽⡅⣅⡥⣥⡕⣕⡵⣵⡍⣍⡭⣭⡝⣝⡽⣽⠃⢃⠣⢣⠓⢓⠳⢳⠋⢋⠫⢫⠛⢛⠻⢻⡃⣃⡣⣣⡓⣓⡳⣳⡋⣋⡫⣫⡛⣛⡻⣻⠇⢇⠧⢧⠗⢗⠷⢷⠏⢏⠯⢯⠟⢟⠿⢿⡇⣇⡧⣧⡗⣗⡷⣷⡏⣏⡯⣯⡟⣟⡿⣿']}})
String.getBaseChars = function(b,isU=false) {
    switch (b) {
        case 2:
        case 8:
        case 10:
        case 16:
        case 32:
        case 36:
        case 64: return (isU ? String.Base64URL : String.Base64).slice(0, b)
        case 256: return String.Base256
        default: throw new TypeError(`引数は2,8,10,16,32,36,64,256のいずれかであるべきです。`);
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
BigInt.getFigureValuesOfBase = function(N,B,A) {// N:数, B:基数, A:各桁の値を0〜B-1の値でセットした配列
    if (undefined===A) {A = []}
    const Q = N / B; // 商
    const R = N % B; // 余り
    A.push(R);
    if (0n===Q) {A.reverse()}
    return 0n===Q ? A : BigInt.getFigureValuesOfBase(Q,B,A)
}
Number.fromFigureValues = function(figs, base) {
    if (53 < base) {return BigInt.fromFigureValues(figs, base)}
    //if (!figs.every(f=>Number.isSafeInteger(f) && 0<f && f<base)) {throw new TypeError(`第一引数figsの要素は第二引数baseより小さく0より大きい正数であるべきです。`)}
    if (!figs.every(f=>0<f && f<base)) {throw new TypeError(`第一引数figsの要素は第二引数baseより小さく0より大きい正数であるべきです。`)}
    return figs.reduce((s,v,i)=>s+(v*(base**i)),0);
}
BigInt.fromFigureValues = function(figs, base) {
    if (base <= 53) {return Number.fromFigureValues(figs, base)}
    console.log(figs, base)
    if (!figs.every(f=>0<f && f<base)) {throw new TypeError(`第一引数figsの要素は第二引数baseより小さく0より大きい正数であるべきです。`)}
    const B = BigInt(base);
    return figs.reduce((s,v,i)=>s+((BigInt(v)*(B**BigInt(i)))),0n);
}

/*
BigInt.toSafeInteger = function(bi) {
    const n = parseInt(bi);
    if (Number.isSafeInteger(n)) {return n}
    throw new TypeError(`引数のBigIntはNumber.isSafeInteger()で真を返す値であるべきです。`)
}
*/
Number.fromBaseN = function(str, base, isU=false) {// BaseNな文字列からNumberを生成する
    if (!(('string'===typeof str || str instanceof String) && 0<str.length)) {throw new TypeError(`第一引数には一文字以上の文字列を指定してください。`)}
    const chars = String.getBaseChars(base, isU);
    const figs = [...str].map(c=>chars.findIndex(C=>C===c)); // 各桁の文字を添字にして返す
    figs.reverse();
    if (figs.some(f=>f===-1)){throw new TypeError(`文字表に存在しない字が見つかりました。次の文字表のいずれかの字だけで構成してください。:${chars}`)}
    const n = figs.reduce((s,v,i)=>s+(v*(base**i)),0);
    console.log(n,figs,chars,str,base,isU)
    if (!Number.isSafeInteger(n)) {throw new TypeError(`Number.isSafeInteger(n)が偽のためNumber型変換を中止します。`)}
    return n;
}
BigInt.fromBaseN = function(str, base, isU=false) {// BaseNな文字列からBigIntを生成する
    if (!(('string'===typeof str || str instanceof String) && 0<str.length)) {throw new TypeError(`第一引数には一文字以上の文字列を指定してください。`)}
    const chars = String.getBaseChars(base, isU);
    const figs = [...str].map(c=>BigInt(chars.findIndex(C=>C===c))); // 各桁の文字を添字にして返す
    figs.reverse();
    if (figs.some(f=>f===-1n)){throw new TypeError(`文字表に存在しない字が見つかりました。次の文字表のいずれかの字だけで構成してください。:${chars}`)}
    console.log(figs,chars,str,base,isU)
    return figs.reduce((s,v,i)=>s+(v*(BigInt(base)**BigInt(i))),0n);
}
String.fromInt = function(value, base, isU=false, signed=false) {//数valueを基数baseとした文字列に変換して返す
    if ([value,base].every(v=>Number.isSafeInteger(v))) {// Number型
        if (signed
            ? (0<=value && value<=2**base-1)
            : ((-2)**base<=value && value<=2**base-1)) {
            const figs = Number.getFigureValuesOfBase(value, base, isU);
            const chars = String.getBaseChars(base, isU);
            return figs.map(f=>chars[f]).join('');
        } else {throw new TypeError(`valueは指定したbaseとsignedが示す範囲外でした。value:${value},base:${base},signed:${signed}`)}
    } else if ([value,base].every(v=>'bigint'===v)) {// BigInt型
        if (signed
            ? (0n<=value && value<=2n**base-1n)
            : ((-2n)**base<=value && value<=2n**base-1n)) {
            const figs = BigInt.getFigureValuesOfBase(value, base, isU);
            const chars = String.getBaseChars(base, isU);
            return figs.map(f=>chars[f]).join('');
        } else {throw new TypeError(`valueは指定したbaseとsignedが示す範囲外でした。value:${value},base:${base},signed:${signed}`)}
    } else {throw new TypeError(`value,baseはNumber.isSafeInteger(v)かBigIntな値であるべきです。`)}
}
class Seed {
//    constructor(value=undefined, bitSize=32, signed=false, base=64, isBase64URL=false) {
    constructor(value=undefined, type=undefined, base=64, isBase64URL=false) {
        this._type = type instanceof IntType ? type : IntType.get(32);
        if (this._type.typeof!==typeof value){throw new TypeError(`第一引数valueの型は第二引数typeのbitSizeが53以下ならNumber, それより大きければBigIntであるべきです。`)}
        this._v = value;
        this._base = base;
        this._isBase64URL = isBase64URL;
    }
    get type() {return this._type}
    get i() {console.log(this._v);return this._type.convert(this._v)} // integer
    get s() {
        console.log(this._base)
        const chars = String.getBaseChars(this._base, this._isBase64URL);
        const figs = this._type.type.getFigureValuesOfBase(this._v, this._base);
        return figs.map(f=>chars[f]).join('');
    }
    static of(arg) {// Number(uint32)が1個以上(bitSize=32)/Stringが1個(`u32b16:FFFFFFFF`等の書式に従う)
        if (Number.isSafeInteger(arg) && 0<=arg && arg<=2**32-1) {return new Seed(arg, IntType.get(32), 64, true)}
        else if ('string'===typeof arg || arg instanceof String) {//`u32b16:FFFFFFFF`等の書式に従った文字列
            //const PATTERN = /^u([0-9]{1,})b([0-9]{1,}u?):(.+)$/;
            const PATTERN = /^([u|s])([0-9]{1,})b([0-9]{1,}u?):(.+)$/;
            const match = arg.match(PATTERN);
            if (!match) {throw new TypeError(`引数が文字列なら ${PATTERN} の正規表現に従う値のみ有効です。u|sは符号付きか否か、第一数はBitWidth, 第二数は使用する文字種を決定するBaseN。もし末尾にuがつけばBase64URL文字種を使う。:${arg}`)}
            console.log(match)
            const [signedStr, bitSizeStr, baseStr, valueStr] = [match[1], match[2], match[3], match[4]];
            const signed = 's'===signedStr;
            //const base = parseInt(baseStr);
            const base = BigInt(baseStr);
            const isBase64URL = baseStr.endsWith('u');
//            const valueBigInt = BigInt.fromBaseN(valueStr, parseInt(base), isBase64URL);
            const type = IntType.get(parseInt(bitSizeStr), signed);
            const value = type.type.fromBaseN(valueStr, parseInt(base), isBase64URL);
            //console.log(parseInt(bitSizeStr), valueBigInt)
            console.log(parseInt(bitSizeStr), value, base, isBase64URL)
            return new Seed(value, type, parseInt(base), isBase64URL)
            //if (base < 53n && 0n<=valueBigInt && valueBigInt<=Number.MAX_SAFE_INTEGER) {return new Seed(parseInt(valueBigInt), type, parseInt(base), isBase64URL)}
            //else {return new Seed(valueBigInt, type, parseInt(base), isBase64URL)}
        }
        else {throw new TypeError(`引数は0〜4294967295迄の整数かu32b16:FFFFFFFF等の文字列であるべきです。`)}
    }
}
/*
class NumberSeed { // 0〜2^53-1
    constructor(value=undefined, bitSize=32, signed=false, base=64, isBase64URL=false) {// 
        if (52 < bitSize) {throw new TypeError(`bitSizeは52以下であるべきです。:${bitSize}`)}
        //if (undefined===value) {value = new Date().getTime()}
        if (undefined===value) {value = 0; while (0===value) {value = Math.random() * (2**bitSize)}}
        if (!(Number.isSafeInteger(value) && 0<=value)) {throw new TypeError(`valueは0以上の整数であるべきです。:${value}`)}
        if (![2,8,10,16,32,36,64,256].some(v=>v===base)) {throw new TypeError(`baseは[2,8,10,16,32,36,64,256]のいずれかであるべきです。:${base}`)}
        this._bitSize = bitSize;
        this._signed = !!signed;
        this._base = base;
        this._isBase64URL = isBase64URL; // [+/]or[-_]
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return Math.floor(this._bitSize / 8)}
    get signed() {return this._signed}
    get base() {return this._base}
//    get min() {return 0}
//    get max() {return 2**this._bitSize-1}
//    get width() {return 2**this._bitSize}
//    get min() {return this._signed ? (((this._width) / 2)*-1) : 0}
//    get max() {return this._signed ? (((this._width) / 2)-1) : this._width-1}
    get size() {return 2**this._bitSize} // valueSize | pieces
    get min() {return this._signed ? (((this._size) / 2)*-1) : 0}
    get max() {return this._signed ? (((this._size) / 2)-1) : this._size-1}

    get n() {return this._value}
    set n(v) {
        if (!Number.isSafeInteger(value) && 0<=v) {throw new TypeError(`valueは0以上${Number.MAX_SAFE_INTEGER}以下の整数であるべきです。:${v}`)}
        this._value = v;
    }
    get b() {return BigInt(this._value)}
    set b(v) {
        if (!('bigint'===typeof v && 0n<=v)) {throw new TypeError(`valueは0n以上の長整数であるべきです。:${v}`)}
        this.n = parseInt(v);
    }
    get i() {return this._value}
    set i(v) {
        if (Number.isSafeInteger(value) && 0<=v) {this.n=v}
        else if ('bigint'===typeof v && 0n<=v) {this.b=v}
        else {throw new TypeError(`valueはNumberかBigInt型で0以上${Number.MAX_SAFE_INTEGER}以下の値であるべきです。:${v}`)}
    }
    get s() {
        const chars = String.getBaseChars(this._base, this._isBase64URL);
        const figs = Number.getFigureValuesOfBase(this._value, this._base);
        return figs.map(f=>chars[f]).join('')
    }
}
class BigIntSeed {
    constructor(value, bitSize=64n, signed=false, base=64n) {// 
        if (!('bigint'===typeof value && 0n<=value)) {throw new TypeError(`valueは0n以上の長整数であるべきです。:${value}`)}
        if (bitSize <= 32n) {throw new TypeError(`bitSizeは32より大きいべきです。:${bitSize}`)}
        if (![2n,8n,10n,16n,32n,36n,64n,256n].some(v=>v===base)) {throw new TypeError(`baseは[2n,8n,10n,16n,32n,36n,64n,256n]のいずれかであるべきです。:${base}`)}
        this._bitSize = bitSize;
        this._signed = !!signed;
        this._base = base;
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return this._bitSize / 8n}
    get signed() {return this._signed}
    get base() {return this._base}
//    get min() {return 0n}
//    get max() {return 2n**this._bitSize-1n}
    get width() {return 2n**this._bitSize}
    get min() {return this._signed ? (((this._width) / 2n)*-1) : 0n}
    get max() {return this._signed ? (((this._width) / 2n)-1) : this._width-1n}

    get n() {
        const n = parseInt(this._value);
        if (!Number.isSafeInteger(n) && 0<=n) {throw new TypeError(`valueは0以上${Number.MAX_SAFE_INTEGER}以下の範囲を超過しているためNumber型変換を中止しました。:${this._value}`)}
        return n;
    }
    set n(v) {
        if (!Number.isSafeInteger(value) && 0<=v) {throw new TypeError(`valueは0以上${Number.MAX_SAFE_INTEGER}以下の整数であるべきです。:${v}`)}
        const b = BigInt(v);
        if (0n <= b && b <= this.max) {this._value = b}
        throw new TypeError(``)
    }
    get b() {return BigInt(this._value)}
    set b(v) {
        if (!('bigint'===typeof v && 0n<=v)) {throw new TypeError(`valueは0n以上の長整数であるべきです。:${v}`)}
        this.n = parseInt(v);
    }
    get i() {return this._value}
    set i(v) {
        if (Number.isSafeInteger(value) && 0<=v) {this.n=v}
        else if ('bigint'===typeof v && 0n<=v) {this.b=v}
        else {throw new TypeError(`valueはNumberかBigInt型で0以上${Number.MAX_SAFE_INTEGER}以下の値であるべきです。:${v}`)}
    }
    get s() {
        const chars = String.getBaseChars(this._base);
        const figs = BigInt.getFigureValuesOfBase(this._value, this._base);
        return figs.map(f=>chars[f]).join('')
    }

}
class Seed {
    constructor(value, bitSize=32, signed=false, base=64) {// 
        if ([value, bitSize, base].every(v=>Number.isSafeInteger(v))){return new NumberSeed(value, bitSize, signed, base)}
        else if ([value, bitSize, base].every(v=>Number.isSafeInteger(v))){return new BigIntSeed(value, bitSize, signed, base)}
        throw new TypeError(`引数value, bitSize, baseは全てNumberか全てBigInt型のみ有効です。`)
    }
    static of(arg) {// Number(uint32)が1個以上(bitSize=32)/Stringが1個(`u32b16:FFFFFFFF`等の書式に従う)
        if (Number.isSafeInteger(v) && 0<=v && v<=2**32-1) {return new NumberSeed(arg)}
        else if ('string'===typeof arg || arg instanceof String) {//`u32b16:FFFFFFFF`等の書式に従った文字列
            //const PATTERN = /^u([0-9]{1,})b([0-9]{1,}u?):(.+)$/;
            const PATTERN = /^([u|s])([0-9]{1,})b([0-9]{1,}u?):(.+)$/;
            const match = arg.match(PATTERN);
            if (!match) {throw new TypeError(`引数が文字列なら ${PATTERN} の正規表現に従う値のみ有効です。u|sは符号付きか否か、第一数はBitWidth, 第二数は使用する文字種を決定するBaseN。もし末尾にuがつけばBase64URL文字種を使う。:${arg}`)}
            const [signedStr, bitSizeStr, baseStr, valueStr] = [match[1], match[2], match[3], match[4]];
            const signed = 's'===signedStr;
            //const base = parseInt(baseStr);
            const base = BigInt(baseStr);
            const valueBigInt = BigInt.fromBaseN(valueStr, base, baseStr.endsWith('u'));
            if (base < 53 && 0n<=valueBigInt && valueBigInt<=Number.MAX_SAFE_INTEGER) {return new NumberSeed(parseInt(valueBigInt), parseInt(bitSizeStr), signed, parseInt(base))}
            else {return new BigIntSeed(valueBigInt, BigInt(bitSizeStr), signed, base)}
//            const chars = String.getBaseChars(base, baseStr.endsWith('u'));
//            const figs = [...valueStr].
        }
        else {throw new TypeError(`引数は0〜4294967295迄の整数かu32b16:FFFFFFFF等の文字列であるべきです。`)}
    }
}
*/
















/*
class Seed {
    constructor(value, bitSize=32, signed=false, base=64) {// 
        if ((Number.isSafeInteger(bitSize) && 0<bitSize) || ('bigint'===typeof bitSize && 0n<bitSize)) {
            if (52 < bitSize) {//Number型
                if (Number.isSafeInteger(value) && 0<=value && value<=2**bitSize-1) {

                } else {throw new TypeError(`valueは0以上${2**bitSize-1}以下の整数であるべきです。:${value}`)}
            } else {//BigInt型
                this._value = BigInt(value);
                BigInt(bitSize)
                if ('bigint'===typeof value && 0n<=value && value<=2n**BigInt(bitSize)-1n)
            }

        } else {throw new TypeError(`bitSizeは1以上の整数であるべきです。:${bitSize}`)}

        if (!(Number.isSafeInteger(value) && 0<=value)) {throw new TypeError(`valueは0以上の整数であるべきです。:${value}`)}
        if (52 < bitSize) {throw new TypeError(`bitSizeは52以下であるべきです。:${bitSize}`)}
        if (![2,8,10,16,32,36,64,256].some(v=>v===base)) {throw new TypeError(`baseは[2,8,10,16,32,36,64,256]のいずれかであるべきです。:${base}`)}
        this._bitSize = bitSize;
        this._signed = !!signed;
        this._base = base;
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return Math.floor(this._bitSize / 8)}
    get signed() {return this._signed}
    get base() {return this._base}

    get n() {return this._value}
    set n(v) {
        if (!Number.isSafeInteger(value) && 0<=v) {throw new TypeError(`valueは0以上${Number.MAX_SAFE_INTEGER}以下の整数であるべきです。:${v}`)}
        this._value = v;
    }
    get b() {return BigInt(this._value)}
    set b(v) {
        if (!('bigint'===typeof v && 0n<=v)) {throw new TypeError(`valueは0n以上の長整数であるべきです。:${v}`)}
        this.n = parseInt(v);
    }
    get i() {return this._value}
    set i(v) {
        if (Number.isSafeInteger(value) && 0<=v) {this.n=v}
        else if ('bigint'===typeof v && 0n<=v) {this.b=v}
        else {throw new TypeError(`valueはNumberかBigInt型で0以上${Number.MAX_SAFE_INTEGER}以下の値であるべきです。:${v}`)}}
    }
    get s() {
        const chars = String.getBaseChars(this._base);
        const figs = Number.getFigureValuesOfBase(this._value, this._base);
        return figs.map(f=>chars[f]).join('')
    }

}
*/
//window.NumberSeed = NumberSeed;
//window.BigIntSeed = BigIntSeed;
window.IntType = IntType;
window.Seed = Seed;
})();
