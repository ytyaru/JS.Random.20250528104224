(function(){
class I32 {// Integer 32bit 4Byte
    static u2s(N) {return (0x7FFFFFFF<N) ? N-0x100000000 : N} // unsign to sign -2^32〜0〜2^32-1
    static s2u(N) {return (N<0) ? N+0x100000000 : N} // sign to unsign 0〜2^32-1
    static toU(V) {return this.s2u(this._v(V))}
    static toS(V) {return this.u2s(this._v(V))}
    static _v(V) {return (Number.isSafeInteger(V)) ? V : new Date().getTime()} // 2^53-1整数でないなら現在時刻を用いる
}
class Randomer {
    static get(algorithmName) {
        algorithmName = algorithmName.toLowerCase();
        switch(algorithmName) {
            // 線形合同法(Linear Congruential Generator)
            case 'lcg': return LCG()
            // Xorshift[32|128|128p]
            case 'xorshift32': return new Xorshift32()
            case 'xorshift128': return new Xorshift128()
            case 'xorshift128+': return new Xorshift128p()
            // 
            case '': return 
            default: return 
        }
        if ('xorshift32')
    }

}
class Seed {
    constructor(len=1) {
        this._len = 1;
        this._v = new UintArray32(len)
    }
    //get s53() {} //   sign int 53bit Number型 -2⁵³-1〜0〜2⁵³-1 (±9007199254740991)
    //get f64() {} //   sign int 53bit Number型 -2⁵³-1〜0〜2⁵³-1 (±9007199254740991) IEEE754 64bit浮動小数点数における整数
    //get n() {} //   sign int 53bit Number型 -2⁵³-1〜0〜2⁵³-1 (±9007199254740991) IEEE754 64bit浮動小数点数における整数

    get s32() {} //   sign int 32bit Number型 -2³¹〜0〜-2³¹-1
    get u32() {} // unsign int 32bit Number型 -2³²〜

    get s64() {} // unsign int 64bit BigInt型 -
    get u64() {} // unsign int 64bit BigInt型 -
}
// 線形合同法
class LCG {
    constructor(seed) {
        this._seed = I32.toU(seed);
        if (0===this._seed) {throw new TypeError(`seedは0以外を指定してください。`)}
        this._seed = Number.isInteger(seed) && 0<seed && seed<(2**32) ? seed : new Date().getTime();
    }
    get u32() {// unsign int 32bit Number型 -2³²〜0〜2³²-1
        const A = 6;
        const B = 0;
        const M = (2**32);
        return (A * this._seed + B) % M;
    }
}
// 線形帰還シフトレジスタ
class LFSR {

}

// 暗号論的擬似乱数生成器 
class CSPRNG_Default {
//    static fromTypedArray(typedAry) {return crypto.getRandomValues([Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, BigInt64Array, BigUint64Array].some(t=>typedAry instanceof t) ? typedArray : new Uint32Array(1))}
    constructor(typedArrayCls, length) {
        this._type = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, BigInt64Array, BigUint64Array].some(t=>t===typedArrayCls) ? typedArrayCls : Uint32Array);
        this._length = Number.isSafeInteger(length) && 0 < length ? length : 1;
    }
    get a() {return crypto.getRandomValues(new this._type(this._length))}
    get r() {
        if (1!==this._length){throw new TypeError(`lengthが1の時のみ使用できます。`)}
        const a = this.a;

        const bs = this.#bitSize;
        if (bs < 53) {
            const L = 2**bs;
            const a = this.a;
            return 1===a.length ? a[0] : this.a.reduce((s,v)=>s+v) / a.length
            
        const L = 2**bs
        if (bs < 53) {return }
        bs < 53 ? 2**bs : 2n**BigInt(bs)
        const 
        2**
    }
    get #bitSize() {
        switch(this._type) {
            case Int8Array
            case Uint8Array
            case Uint8ClampedArray: return 8;
            case Uint16Array: return 16
            case Int32Array
            case Uint32Array: return 32
            case BigInt64Array
            case BigUint64Array: return 64
            default: throw new TypeError(`対象外`)
        }
    }
}
// const CR = new CSPRNG.Default()
// CR.a[0]

const PRNG = {// Pseudo Random Number Generator 疑似乱数生成器
    LCG: LCG,
    LFSR: LFSR, 
}
const CSPRNG = {// Cryptographically Secure Pseudo Random Number Generator 暗号論的擬似乱数生成器
    Default: CSPRNG_Default,
}
})();
