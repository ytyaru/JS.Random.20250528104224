(function(){
class I32 {// Integer 32bit 4Byte Number
    static u2s(N) {return (0x7FFFFFFF<N) ? N-0x100000000 : N} // unsign to sign -2^32〜0〜2^32-1
    static s2u(N) {return (N<0) ? N+0x100000000 : N} // sign to unsign 0〜2^32-1
    static toU(V) {return this.s2u(this._v(V))}
    static toS(V) {return this.u2s(this._v(V))}
    static _v(V) {return (Number.isSafeInteger(V)) ? V : new Date().getTime()} // 2^53-1整数でないなら現在時刻を用いる
}
class R32 {//s32/u32な値を0以上1未満の実数にして返す
    static fromN(n) {
        if (Number.isSafeInteger(n)) {
            const N = n & 0xFFFFFFFF;
                 if (0===n) {return n} // u32なら0, s32なら0.5になるべきなのだが、u/s判断できない：ｑ
            else if (0<n && n <=0xFFFFFFFF) {return n/0x100000000} // unsigned int 32
            //else if ((-2)**31<=n && n<0) {return (n+0x100000000)/0x100000000} // signed int 32
            else if ((-2)**31<=n && n<0) {return (0x100000000-(n*-1))/0x100000000} // signed int 32
            else if (0xFFFFFFFF<n) {return (n & 0xFFFFFFFF)/0x100000000}
            else if (n<(-2)**31) {return ((n & 0xFFFFFFFF)+0x100000000)/0x100000000}
        }
        //throw new TypeError(`引数nは(-2)**31〜2**32-1迄のNumber型な整数であるべきです。:${n}`,n)
        throw new TypeError(`引数nはNumber.isSafeInteger(n)な値であるべきです。:${n}:`,n)
    }
    static fromNs(ns) {
        const rs = ns.map((n,i)=>{[...new Array(i+1)].map(_=>n/=0x100000000);return n;});
        return rs.reduce((s,v,i)=>s+v < 1 ? s+v : s,0);
    }
}
class Xorshift32 {
    constructor(seed) {
        console.log(seed instanceof Seed)
        this._seed = seed instanceof Seed ? seed : (Seed.of((Number.isSafeInteger(seed) && 0!==seed||('string'===typeof seed || seed instanceof String)) ? seed : Date.now()));
        console.log(this._seed)
        if (32!==this._seed.type.bitSize || false!==this._seed.type.signed || Number!==this._seed.type.type){throw new TypeError(`シードは値が非0かつ型が32bitのunsignedでありNumber型を返すIntTypeインスタンスであるべきです。例えばIntType.get('u32b16:FFFFFFFF')等です。`)}
        this._s = this._seed.i;
    }
    _next() {
        this._s ^= this._s<<13;
        this._s ^= this._s>>>17;
        this._s ^= this._s<<5;
        return I32.s2u(this._s);
    }
    get i() {return this._next()} // 0≤i≤4294967295
    get r() {return this._next() / 0xFFFFFFFF} // 0≤r<1
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
}
BigInt.fromU32Numbers = function(...u32ns) {
    return [...u32ns].reduce((s,v,i)=>{
        const F32 = 32n*BigInt(i);
        return s+(BigInt(v)<<F32);
    }, 0n);
}
BigInt.toU32Numbers = function(v, length) {
    if ('bigint'!==typeof v){throw new TypeError(`引数vはBigInt型であるべきです。`)}
    if (!(Number.isSafeInteger(length) && 0<length)) {throw new TypeError(`引数lengthはNumber.isSafeInteger()な自然数であるべきです。:${length}`)}
    const u32ns = [...new Array(length)].map((_,f)=>{
        const F32 = 32n*BigInt(f);
        return Number((v & (0xFFFFFFFFn << F32)) >> F32);
    });
    u32ns.reverse();
    return u32ns;
}
class UintValues {
    constructor(bitSize, ...vals) {
        this._type = IntType.get(bitSize);
        const length = Math.ceil(bitSize/32);
        this._u32a = new Uint32Array(length);
        const VALS = [...vals];
        if (4===vals.length && VALS.every(a=>Number.isSafeInteger(a) && 0<=a && a<=0xFFFFFFFF) && !VALS.every(a=>a===0)) {
            VALS.map((v,i)=>this._u32a[i]=v);
        }
        else if (1===vals.length && (vals[0] instanceof Uint32Array && 4===vals[0].length)) {
            vals[0].map((v,i)=>this._u32a[i]=v);
        }
        else if (1===vals.length && vals[0] instanceof Seed && bitSize===vals[0].type.bitSize && false===vals[0].type.signed && 0n!==vals[0].i) {
            const i = vals[0].i;
            const u32ns = BigInt.toU32Numbers(i,4);
            u32ns.map((v,i)=>this._u32a[i]=v);
        }
        else {
            console.warn(`指定されたシードは無効なので自動生成します。:`, vals)
            let Vs = null;
            do {Vs = [...new Array(4)].map(v=>Math.floor(Math.random()*0x100000000));}
            while (Vs.every(v=>v===0));
            Vs.map((v,i)=>this._u32a[i]=v);
        }

    }
    // 単一整数Number型 bitSize<=53 ? Number : BigInt
    get i() {
        const b = this.b;
        return 53 < this._type.bitSize ? b : Number(b);
    }
    // 単一整数BigInt型
    get b() {return BigInt.fromU32Numbers(...this._u32a)}
    // 複数u32整数 Number配列
    get ns() {return this._u32a}
    // Uint32Array
    get u32a() {return new Uint32Array(this._u32a)}
    // 0.0≦r＜1.0 浮動少数 Number
    get r() {return R32.fromNs(this.ns);}
}
class Xorshift128 {
    constructor(...args){// 1/0/0/0 ~ 4294967295
        this._v = new UintValues(128, ...args);
        console.log(this._v)
    }
    next(){
        let t = this._v.ns[0]^(this._v.ns[0]<<11);
        this._v.ns[0]=this._v.ns[1]; this._v.ns[1]=this._v.ns[2]; this._v.ns[2]=this._v.ns[3];
        this._v.ns[3]=(this._v.ns[3]^(this._v.ns[3]>>>19))^(t^(t>>>8));
        return I32.s2u(this._v.ns[3]);
    }
    get i() {return this.next()}
    get r() {return R32.fromN(this.i)}
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
}
//https://github.com/fanatid/xorshift.js/
class Xorshift128p {
    constructor(...args) {//seeds:new Uint32Array(4)
        this._v = new UintValues(128, ...args);
    }
    _next() {
        const ns = this._v.ns.map(n=>n>>>0);
        let [s1H,s1L] = [ns[0],ns[1]];
        const [s0H,s0L] = [ns[2],ns[3]];
        this._v.ns[0]=s0H; this._v.ns[1]=s1L;

        s1H ^= ((s1H & 0x000001ff) << 23) | (s1L >>> 9);
        s1L ^= (s1L & 0x000001ff) << 23;
        // s[1] = s1 ^ s0 ^ (s1 >> 17) ^ (s0 >> 26);
        this._v.ns[2] ^= s1H ^ (s1H >>> 17) ^ (s0H >>> 26);
        this._v.ns[2] >>>= 0;
        this._v.ns[3] ^= s1L ^ (((s1H & 0x0001ffff) << 15) | (s1L >>> 17)) ^ (((s0H & 0x03ffffff) << 6) | (s0L >>> 26));
        this._v.ns[3] >>>= 0;
        // return s[1] + s0;
        const t = this._v.ns[3] + s0L;
        const NS = [
            (((t / 0x0100000000) | 0) + this._v.ns[2] + s0H) >>> 0,
            t >>> 0
        ];
        return NS.map(n=>I32.s2u(n));
    }
    get ns() {return this._next()}
    get a() {return new Uint32Array(this._next())}
    get i() {
        const u32s = this._next();
        const i = (BigInt(u32s[0])<<32n) + BigInt(u32s[1]);
        return i;
    }
    get r() {return R32.fromNs(this.ns.map(n=>n>>>0));}
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
}
window.I32 = I32;
window.R32 = R32;
window.PRNG = {
    Xorshift32: Xorshift32,
    Xorshift128: Xorshift128,
    Xorshift128p: Xorshift128p,
};
})();
