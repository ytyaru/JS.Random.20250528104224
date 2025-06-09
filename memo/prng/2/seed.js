(function(){// IntTypeに依存する
//if (IntType in window) {throw new Error(`IntTypeを先にインポートしてください。`)}
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
Number.fromBaseN = function(str, base, isU=false) {// BaseNな文字列からNumberを生成する
    if (!(('string'===typeof str || str instanceof String) && 0<str.length)) {throw new TypeError(`第一引数には一文字以上の文字列を指定してください。`)}
    const chars = String.getBaseChars(base, isU);
    const figs = [...str].map(c=>chars.findIndex(C=>C===c)); // 各桁の文字を添字にして返す
    figs.reverse();
    if (figs.some(f=>f===-1)){throw new TypeError(`文字表に存在しない字が見つかりました。次の文字表のいずれかの字だけで構成してください。:${chars}`)}
    const n = figs.reduce((s,v,i)=>s+(v*(base**i)),0);
//    console.log(n,figs,chars,str,base,isU)
    if (!Number.isSafeInteger(n)) {throw new TypeError(`Number.isSafeInteger(n)が偽のためNumber型変換を中止します。`)}
    return n;
}
BigInt.fromBaseN = function(str, base, isU=false) {// BaseNな文字列からBigIntを生成する
    if (!(('string'===typeof str || str instanceof String) && 0<str.length)) {throw new TypeError(`第一引数には一文字以上の文字列を指定してください。`)}
    const chars = String.getBaseChars(base, isU);
    const figs = [...str].map(c=>BigInt(chars.findIndex(C=>C===c))); // 各桁の文字を添字にして返す
    figs.reverse();
    if (figs.some(f=>f===-1n)){throw new TypeError(`文字表に存在しない字が見つかりました。次の文字表のいずれかの字だけで構成してください。:${chars}`)}
//    console.log(figs,chars,str,base,isU)
    return figs.reduce((s,v,i)=>s+(v*(BigInt(base)**BigInt(i))),0n);
}
String.fromInt = function(value, bitSize, base, isU=false) {
    const type = IntType.get(bitSize, false);
    const v = type.convert(value); // unsigned型で強制変換する。
    const figs = Number.getFigureValuesOfBase(value, base);
    const chars = String.getBaseChars(base, isU);
    return figs.map(f=>chars[f]).join('');
}
class Seed {
    constructor(value=undefined, type=undefined, base=64, isBase64URL=false) {
        const isT = type instanceof IntType;
        this._type = isT ? type : IntType.get(32);
        this._v = isT ? this._type.convert(value) : 0;
        if (this._type.typeof!==typeof this._v){throw new TypeError(`第一引数valueの型は第二引数typeのbitSizeが53以下ならNumber, それより大きければBigIntであるべきです。`)}
        //if (this._type.typeof!==typeof value){throw new TypeError(`第一引数valueの型は第二引数typeのbitSizeが53以下ならNumber, それより大きければBigIntであるべきです。`)}
        //this._v = isT ? this._type.convert(value) : 0;
        this._base = [2,8,10,16,32,36,64,256].some(b=>b===base) ? base : 64;
//        this._v = value;
//        this._base = base;
        this._isBase64URL = !!isBase64URL;
    }
    get type() {return this._type}
    get i() {return this._type.convert(this._v)} // integer
    get s() {return String.fromInt(this._v, this._type.bitSize, this._base, this._isBase64URL);}
    static of(arg) {// Number(uint32)が1個以上(bitSize=32)/Stringが1個(`u32b16:FFFFFFFF`等の書式に従う)
        if (Number.isSafeInteger(arg)){return new Seed(arg, IntType.get(32), 64, true)}
        else if ('bigint'===typeof arg){return new Seed(arg, IntType.get(64), 64, true)}
//        if (Number.isSafeInteger(arg) && 0<=arg && arg<=2**32-1) {return new Seed(arg, IntType.get(32), 64, true)}
        else if ('string'===typeof arg || arg instanceof String) {//`u32b16:FFFFFFFF`等の書式に従った文字列
            const PATTERN = /^([u|s])([0-9]{1,})b([0-9]{1,})(u?):(.+)$/;
            const match = arg.match(PATTERN);
            if (!match) {throw new TypeError(`引数が文字列なら ${PATTERN} の正規表現に従う値のみ有効です。u|sは符号付きか否か、第一数はBitWidth, 第二数は使用する文字種を決定するBaseN。もし型の末尾にuがつけばBase64URL文字種を使う。:${arg}`)}
//            console.log(match)
            const [signedStr, bitSizeStr, baseStr, is64URL, valueStr] = [match[1], match[2], match[3], match[4], match[5]];
            const signed = 's'===signedStr;
            const base = BigInt(baseStr);
            const isBase64URL = 'u'===is64URL;
            const type = IntType.get(parseInt(bitSizeStr), signed);
            const value = type.type.fromBaseN(valueStr, parseInt(base), isBase64URL);
//            console.log(parseInt(bitSizeStr), value, base, isBase64URL)
            return new Seed(value, type, parseInt(base), isBase64URL)
        }
        else {throw new TypeError(`引数はNumber.isSafeInteger()なNumber型かu32b16:FFFFFFFF等の文字列であるべきです。`)}
        //else {throw new TypeError(`引数は0〜4294967295迄の整数かu32b16:FFFFFFFF等の文字列であるべきです。`)}
    }
}
window.IntType = IntType;
window.Seed = Seed;
})();
