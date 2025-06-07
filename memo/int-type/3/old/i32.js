// JS言語仕様上、
class I32 {// Integer 32bit 4Byte
    static u2s(N) {return (0x7FFFFFFF<N) ? N-0x100000000 : N} // unsign to sign -2^32〜0〜2^32-1
    static s2u(N) {return (N<0) ? N+0x100000000 : N} // sign to unsign 0〜2^32-1
//    static toU(V) {return this.s2u((Number.isSafeInteger(V)) ? V : new Date().getTime())} // 2^53-1整数でないなら現在時刻を用いる
//    static toS(V) {return this.u2s((Number.isSafeInteger(V)) ? V : new Date().getTime())}
    static toU(V) {return this.s2u(this._v(V))}
    static toS(V) {return this.u2s(this._v(V))}
    static _v(V) {return (Number.isSafeInteger(V)) ? V : new Date().getTime()} // 2^53-1整数でないなら現在時刻を用いる

}


//class UnsignedIntegerType {
class UintType {
    constructor(bitSize) {
        if (!(Number.isSafeInteger(bitSize) && 0 < bitSize)) {throw new TypeError(`bitSizeは0より大きい整数であるべきです。`)}
        this._bitSize = bitSize;
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return Math.floor(this._bitSize / 8)}

    get type() {return this.#isB ? BigInt : Number}
    get #isB() {return (53 < this._bitSize)}

    get length() {return this.#isB ? 2n**BigInt(this._bitSize) : 2**this._bitSize}
    get min() {return this.#isB ? 0n : 0}
    get max() {return this.length + (this.#isB ? -1n : -1)}

    convert(v) {
        if (this.#isB) {if ('bigint'!==typeof v) {throw new TypeError(`値はBigIntのみ有効です。`)}}
        else {if (!Number.isSafeInteger(v)) {throw new TypeError(`値はNumber.isSafeInteger()のみ有効です。`)}}
//        if (v<0) {console.warn(`値が負数のため正数に強制変換します。:${n}`); v*=((this.#isB) ? -1n : -1);}
        if (v<0) { const m = (v % this.length); return 0===m ? 0 : this.length + m; }
        else {return v % this.length}
    }
}
