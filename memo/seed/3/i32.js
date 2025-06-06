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
