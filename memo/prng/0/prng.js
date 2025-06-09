(function(){
class I32 {// Integer 32bit 4Byte Number
    static u2s(N) {return (0x7FFFFFFF<N) ? N-0x100000000 : N} // unsign to sign -2^32〜0〜2^32-1
    static s2u(N) {return (N<0) ? N+0x100000000 : N} // sign to unsign 0〜2^32-1
    static toU(V) {return this.s2u(this._v(V))}
    static toS(V) {return this.u2s(this._v(V))}
    static _v(V) {return (Number.isSafeInteger(V)) ? V : new Date().getTime()} // 2^53-1整数でないなら現在時刻を用いる
}
class I64 {// Integer 64bit 8Byte BigInt
    static u2s(N) {return (0x7FFFFFFF_FFFFFFFFn<N) ? N-0x1_00000000_00000000n : N} // unsign to sign -2^32〜0〜2^32-1
    static s2u(N) {return (N<0) ? N+0x1_00000000_00000000n : N} // sign to unsign 0〜2^32-1
    static toU(V) {return this.s2u(this._v(V))}
    static toS(V) {return this.u2s(this._v(V))}
    static _v(V) {// 2^53-1整数でないなら現在時刻を用いる
        if ('bigint'===typeof V) {return V}
        const bs = [...new Array(2)].map(()=>BigInt(IntType.get(32).convert(new Date().getTime())));
        return bs[0]<<32 + bs[1]
    }
    //static _v(V) {return ('bigint'===typeof V) ? V : new Date().getTime()} // 2^53-1整数でないなら現在時刻を用いる
}
class Xorshift32 {
    constructor(seed) {
        //this._seed = Seed.of((Number.isSafeInteger(arg)||'bigint'===typeof seed||('string'===typeof seed || seed instanceof String)) ? seed : new Date().getTime());
        //this._seed = Seed.of((Number.isSafeInteger(seed)||('string'===typeof seed || seed instanceof String)) ? seed : new Date().getTime());
        //this._seed = Seed.of((Number.isSafeInteger(seed) && 0!==seed||('string'===typeof seed || seed instanceof String)) ? seed : Date.now());
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
class Xorshift128 {
    constructor(...args){// 1/0/0/0 ~ 4294967295
        const ARGS = [...args];
        if (4===args.length && ARGS.every(a=>Number.isSafeInteger(a) && 0<=a && a<0xFFFFFFFF) && !ARGS.every(a=>a===0)) {
            this.x = args[0]; this.y = args[1]; this.z = args[2]; this.w = args[3];
        }
        else if (1===args.length && (args[0] instanceof Uint32Array && 4===args[0].length)) {
            this.x = args[0][0]; this.y = args[0][1]; this.z = args[0][2]; this.w = args[0][3];
        }
        else if (1===args.length && args[0] instanceof Seed && 128===args[0].type.bitSize && false===args[0].type.signed && 0n!==args[0].i) {
//            0xFFFFFFFFn << 32n*3
//            0xFFFFFFFFn << 32n*2
//            0xFFFFFFFFn << 32n*1
//            0xFFFFFFFFn << 32n*0
            const i = args[0].i;
            console.log(i);
            //const u32s = [...new Array(4)].map((_,f)=>i & (0xFFFFFFFFn << (32n*BigInt(f))));
            const u32s = [...new Array(4)].map((_,f)=>Number(i & (0xFFFFFFFFn << (32n*BigInt(f)))));
            u32s.reverse();
            this.x = u32s[0]; this.y = u32s[1]; this.z = u32s[2]; this.w = u32s[3];
        }
        else {
            //const r32 = new Xorshift32();
            //const [X,Y,Z,W] = [x,y,z,w].map(v=>I32.u2s(Number.isSafeInteger(v) ? v : r32.i));
            //const [X,Y,Z,W] = [x,y,z,w].map(v=>r32.i);
//            const [X,Y,Z,W] = [x,y,z,w].map(v=>Math.floor(Math.random()*0x100000000));
//            if ([X,Y,Z,W].every(v=>v===0)) {X=1}
            let Vs = null;
            do {Vs = [...new Array(4)].map(v=>Math.floor(Math.random()*0x100000000));}
            while (Vs.every(v=>v===0));
            //this.x = X; this.y = Y; this.z = Z; this.w = W;
            this.x = Vs[0]; this.y = Vs[1]; this.z = Vs[2]; this.w = Vs[3];
        }
        console.log('xyzw:', this.x, this.y, this.z, this.w)
    }
    next(){
        let t = this.x^(this.x<<11);
        this.x =this.y, this.y =this.z, this.z =this.w;
        this.w = (this.w^(this.w>>>19))^(t^(t>>>8));
        return I32.s2u(this.w);
    }
    get i() {return this.next()}
    get r() {return this.next() / (0xFFFFFFFF + 1)}
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
}
/*
class Xorshift128 {
    constructor(x, y, z, w){// 1/0/0/0 ~ 4294967295
        const r32 = new Xorshift32();
        const [X,Y,Z,W] = [x,y,z,w].map(v=>I32.u2s(Number.isSafeInteger(v) ? v : r32.i));
        this.x = X; this.y = Y; this.z = Z; this.w = W;
    }
    next(){
        let t = this.x^(this.x<<11);
        this.x =this.y, this.y =this.z, this.z =this.w;
        this.w = (this.w^(this.w>>>19))^(t^(t>>>8));
        return I32.s2u(this.w);
    }
    get i() {return this.next()}
    get r() {return this.next() / (0xFFFFFFFF + 1)}
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
}
// https://blog.visvirial.com/articles/575#V8
class Xorshift128p {
    constructor(seed64, seed64) {
        this._type = IntType.get(64);
        const r = new Xorshift32();
        this._seeds = [BigInt(0), BigInt(0)];
        for (let i=0; i<this._seeds.length; i++) {
            this._seeds[i] = (BigInt(r.i) << 32n) + BigInt(r.i);
        }
    }
    _next() {
        let [s0, s1] = ...this._seeds;
        s0 = s0 ^ (s0 >> 26);
        s1 = s1 ^ (s1 << 23);
        s1 = s1 ^ (s1 >> 17);
        this._seeds[0] = this._seeds[1];
        this._seeds[1] = s0 ^ s1;
        return this._type.convert(this._seeds[0] + this._seeds[1])
         I64.toU
    }
    get i() {return this._next()} // 0≤i≤4294967295
    get r() {return this._next() / 0xFFFFFFFF_FFFFFFFF} // 0<r<1
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
}
*/
       /*
        */
        /*
        s0 = this._type.convert(s0 ^ (this._type.convert(s0 >> 26)));
        s1 = this._type.convert(s1 ^ (this._type.convert(s1 << 23)));
        s1 = this._type.convert(s1 ^ (this._type.convert(s1 >> 17)));
        this._seeds[0] = this._seeds[1];
        this._seeds[1] = this._type.convert(s0 ^ s1);
        return this._type.convert(this._seeds[0] + this._seeds[1]);
        */
//https://raw.githubusercontent.com/fanatid/xorshift.js/refs/heads/master/lib/xorshift128plus.js
class Xorshift128p {
    constructor(...seeds) {//seeds:new Uint32Array(4)
        const SEEDS = [...seeds]
        this._seeds = (4===seeds.length && SEEDS.every(s=>Number.isSafeInteger(s) && 0<=s && s<2**32))
            ? SEEDS
            : [...new Array(4)].map(v=>Math.floor(Math.random()*0x100000000));
        /*
        if (4===seeds.length && SEEDS.every(s=>Number.isSafeInteger(s) && 0<=s && s<2**32)) {
            this._seeds = SEEDS;
        } else {
            this._seeds = [...new Array(4)].map(v=>Math.floor(Math.random()*0x100000000));
        }
        this._seeds = 
        */
    }
    _next() {
        let [s0H,s0L,s1H,s1L] = this._seeds;
        s1H=s0H; s1L=s0L; s0H=s1H; s0L=s1L;
        this._seeds[0]=s0H; this._seeds[1]=s1L;

        s1H ^= ((s1H & 0x000001ff) << 23) | (s1L >>> 9);
        s1L ^= (s1L & 0x000001ff) << 23;
        // s[1] = s1 ^ s0 ^ (s1 >> 17) ^ (s0 >> 26);
        this._seeds[2] ^= s1H ^ (s1H >>> 17) ^ (s0H >>> 26);
        this._seeds[2] >>>= 0;
        this._seeds[3] ^= s1L ^ (((s1H & 0x0001ffff) << 15) | (s1L >>> 17)) ^ (((s0H & 0x03ffffff) << 6) | (s0L >>> 26));
        this._seeds[3] >>>= 0;
        // return s[1] + s0;
        const t = this._seeds[3] + s0L;
        return [
            (((t / 0x0100000000) | 0) + this._seeds[2] + s0H) >>> 0,
            t >>> 0
        ];
    }
    get ns() {return this._next()}
    get a() {return new Uint32Array(this._next())}
    get i() {
        const u32s = this.next();
        return BigInt(u32s[0]<<32) + BigInt(u32s[1]);
    }
    get r() {return this.i / 0x100000000_00000000n}
}

window.PRNG = {
    Xorshift32: Xorshift32,
    Xorshift128: Xorshift128,
    Xorshift128p: Xorshift128p,
};
})();
