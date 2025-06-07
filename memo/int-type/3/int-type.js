(function(){// IntType 整数型。Number/BigInt。Number.isSafeInteger() ±2^53-1 範囲内ならNumber、範囲外ならBigInt型で返す。
// const u32 = IntType.get(32, false)
// const s32 = IntType.get(32, true)
// u32 instanceof IntType
// s32 instanceof IntType
class IntType {
    static _T = new Map();
    static _mk(bitSize, signed=false) {
        const key = `${signed ? 's' : 'u'}${bitSize}`;
        if (!this._T.has(key)) {this._T.set(key, new (signed ? SintType : UintType)(bitSize))}
        return this._T.get(key);
    }
    static get(...args) {
        if (0===args.length) {throw new TypeError(`引数は一つ以上必要です。(bitSize, signed)か(/^([us])([0-9]{1,})$/)のみ有効です。`)}
        else if (('string'===typeof args[0] || args[0] instanceof String)) {
            if (this._T.has(args[0])) {return this._T.get(args[0])}
            else {
                const PATTERN = /^([us])([0-9]{1,})$/;
                const match = args[0].match(PATTERN);
                if (!match) {throw new TypeError(`第一引数が文字列なら正規表現 ${PATTERN} にマッチする値であるべきです。`)}
                const signed = 's'===match[1];
                const bitSize = parseInt(match[2]);
                return this._mk(bitSize, signed);
            }
        } else {return this._mk(...args);}
    }
}
class UintType extends IntType {
    constructor(bitSize) {
        super();
        if (!(Number.isSafeInteger(bitSize) && 0 < bitSize)) {throw new TypeError(`bitSizeは0より大きい整数であるべきです。`)}
        this._bitSize = bitSize;
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return (this._bitSize / 8)}

    get type() {return this._isB ? BigInt : Number}
    get _isB() {return (53 < this._bitSize)}

    get length() {return this._isB ? 2n**BigInt(this._bitSize) : 2**this._bitSize}
    get min() {return this._isB ? 0n : 0}
    get max() {return this.length + (this._isB ? -1n : -1)}

    convert(v) {
        if (this._isB) {if ('bigint'!==typeof v) {throw new TypeError(`値はBigIntのみ有効です。`)}}
        else {if (!Number.isSafeInteger(v)) {throw new TypeError(`値はNumber.isSafeInteger()のみ有効です。`)}}
        //if (v<0) { const m = (v % this.length); return 0===m ? 0 : this.length + m; }
        if (v<0) { const m = (v % this.length); return 0==m ? m : this.length + m; } // NumberとBigInt両方0比較できるよう==にする
        else {return v % this.length}
    }
}
class SintType extends UintType {
    constructor(bitSize){super(bitSize)}
    get _halfLen() {return this._isB ? this.length / 2n : Math.floor(this.length / 2)}
    get min() {return this._isB ? (-2n)**(BigInt(this.bitSize)-1n): (-2)**(this.bitSize-1)}
    get max() {return this._isB ? 2n**(BigInt(this.bitSize)-1n)-1n : 2**(this.bitSize-1)-1}
    convert(v) {
        const u = super.convert(v); // 0〜length-1 例外処理もするため最初に実行すべき。
        if (this.min<=v && v<=this.max) {return v}
        console.log(`Sint u=${u}`)
        // u < this._halfLen ? 正数 : 負数     7FFFFFFF,80000000,80000001
        return u < this._halfLen ? u : (this.min+(u - this._halfLen));
    }
}
window.IntType = IntType;
})();
