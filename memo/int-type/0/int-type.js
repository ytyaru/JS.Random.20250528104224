(function(){
class UintType {
    constructor(bitSize) {
        if (!(Number.isSafeInteger(bitSize) && 0 < bitSize)) {throw new TypeError(`bitSizeは0より大きい整数であるべきです。`)}
        this._bitSize = bitSize;
    }
    get bitSize() {return this._bitSize}
    //get byteSize() {return Math.floor(this._bitSize / 8)}
    get byteSize() {return (this._bitSize / 8)}

    get type() {return this._isB ? BigInt : Number}
    get _isB() {return (53 < this._bitSize)}

    get length() {return this._isB ? 2n**BigInt(this._bitSize) : 2**this._bitSize}
    get min() {return this._isB ? 0n : 0}
    get max() {return this.length + (this._isB ? -1n : -1)}

    convert(v) {
        if (this._isB) {if ('bigint'!==typeof v) {throw new TypeError(`値はBigIntのみ有効です。`)}}
        else {if (!Number.isSafeInteger(v)) {throw new TypeError(`値はNumber.isSafeInteger()のみ有効です。`)}}
//        if (v<0) {console.warn(`値が負数のため正数に強制変換します。:${n}`); v*=((this._isB) ? -1n : -1);}
        if (v<0) { const m = (v % this.length); return 0===m ? 0 : this.length + m; }
        else {return v % this.length}
    }
}
class SintType extends UintType {
    constructor(bitSize){super(bitSize)}
    get _halfLen() {return this._isB ? this.length / 2n : Math.floor(this.length / 2)}
    get min() {return this._isB ? (-2n)**(BigInt(this.bitSize)-1n): (-2)**(this.bitSize-1)}
    get max() {return this._isB ? 2n**(BigInt(this.bitSize)-1n)-1n : 2**(this.bitSize-1)-1}
//    get min() {return this._isB ? (-2n)**this._halfLen : (-2)**this._halfLen}
//    get max() {return this._isB ? 2n**this._halfLen : 2**this._halfLen}
    convert(v) {
        if (this.min<=v && v<=this.max) {return v}
        const u = super.convert(v); // 0〜length-1
        console.log(`Sint u=${u}`)
        // u < this._halfLen ? 正数 : 負数     7FFFFFFF,80000000,80000001
        return u < this._halfLen ? u : (this.min+(this._isB ? u/2 : Math.floor(u/2)));
//        const h = this._isB ? u / this._halfLen : Math.floor(u / this._halfLen);
    }
}
window.UintType = UintType;
window.SintType = SintType;
})();
/*
class IntTypeOfJs {
    constructor(bitSize) {
        if (!(Number.isSafeInteger(bitSize) && 0 < bitSize)) {throw new TypeError(`bitSizeは0より大きい整数であるべきです。`)}
        this._bitSize = bitSize;
    }
    get bitSize() {return this._bitSize}
    get byteSize() {return Math.floor(this._bitSize / 8)}

    get type() {return this.#isB ? BigInt : Number}
    get _isB() {return (53 < this._bitSize)}

    get length() {return this._isB ? 2n**BigInt(this._bitSize) : 2**this._bitSize}
    get min() {return this._isB ? 0n : 0}
    get max() {return this.length + (this._isB ? -1n : -1)}



}
class IntTypeOfNumber {
    constructor(bitSize) {super(bitSize)}
    get length() {return 2**this._bitSize}
    get min() {return this._isB ? 0n : 0}
    get max() {return this.length + (this._isB ? -1n : -1)}

}
class IntTypeOfBigInt {
    constructor(bitSize) {super(bitSize)}
    get length() {return this._isB ? 2n**BigInt(this._bitSize) : 2**this._bitSize}
    get min() {return this._isB ? 0n : 0}
    get max() {return this.length + (this._isB ? -1n : -1)}


}
class FixedSizeIntType {

}
class IntType {

}

*/


/*
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
*/
/*
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
*/
/*
class Overflow {
    overflow(v, bitSize, signed) {
        
    }
    #overflowU(v, bitSize, signed) {

    }
    #overflowS(v, bitSize, signed) {
        const u = this.#overflowS(v); // 0〜length-1
        // u < this._halfLen ? 正数 : 負数     7FFFFFFF,80000000,80000001
        return u < this._halfLen ? u : (this.min+(this._isB ? u/2 : Math.floor(u/2)));

    }


}
class IntType {
    
}
*/

