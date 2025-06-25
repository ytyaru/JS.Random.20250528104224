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
class IntTypes { // pseudo random numbers generator 疑似乱数生成器
    constructor(s, r) {
        this._s = s; this._r = r;
        if (![s,r].every(v=>v instanceof IntType)) {throw new TypeError(`s,rはIntType型インスタンスであるべきです。`)}
    }
    get seedIntType() {return this._s}
    get randomIntType() {return this._r}
}
const Xorshift32IntTypes = new IntTypes(new IntType(32), new IntType(32));
const Xorshift128IntTypes = new IntTypes(new IntType(128), new IntType(32));
const Xorshift128pIntTypes = new IntTypes(new IntType(128), new IntType(64));
//class Prng {} // pseudo random numbers generator 疑似乱数生成器
class Prng { // pseudo random numbers generator 疑似乱数生成器
    constructor(intTypes) {
        if (!(intTypes instanceof IntTypes)) {throw new TypeError(`引数はIntTypes型インスタンスであるべきです。`)}
        this._intTypes = intTypes;
    }
    static get seedIntType() {return this._intTypes.seedIntType}
    static get randomIntType() {return this._intTypes.randomIntType}
    get seedIntType() {return this.constructor.seedIntType}
    get randomIntType() {return this.constructor.randomIntType}
}
/*
class Prng { // pseudo random numbers generator 疑似乱数生成器
    static get seedIntType() {throw new TypeError(`IntType型インスタンスを返却するよう実装すべきです。`)}
    static get randomIntType() {throw new TypeError(`IntType型インスタンスを返却するよう実装すべきです。`)}
}
class Prng { // pseudo random numbers generator 疑似乱数生成器
    constructor(s, r) {
        this._s = s; this._r = r;
        if (![s,r].every(v=>v instanceof IntType)) {throw new TypeError(`s,rはIntType型インスタンスであるべきです。`)}
    }
    get seedIntType() {return this._s}
    get randomIntType() {return this._r}
}
class Prng { // pseudo random numbers generator 疑似乱数生成器
    constructor(s, r) {
        this._seedIntType = s; this._randomIntType = r;
        if (![s,r].every(v=>v instanceof IntType)) {throw new TypeError(`s,rはIntType型インスタンスであるべきです。`)}
    }
    static get seedIntType() {return this._seedIntType }
    static get randomIntType() {return this._randomIntType}
    get seedIntType() {return this.constructor.seedIntType}
    get randomIntType() {return this.constructor.randomIntType}
}

*/
class Xorshift32 extends Prng {
//    static get seedIntType() {return new IntType(32)}
//    static get randomIntType() {return new IntType(32)}
//    static get seedIntType() {return Xorshift32IntType.seedIntType}
//    static get randomIntType() {return Xorshift32IntType.randomIntType}
//    get seedIntType() {return this.constructor.seedIntType}
//    get randomIntType() {return this.constructor.randomIntType}
    constructor(seed) {
        super(Xorshift32IntTypes);
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
class Xorshift128 extends Prng {
//    static get seedIntType() {return new IntType(128)}
//    static get randomIntType() {return new IntType(32)}
//    static get seedIntType() {return Xorshift128IntType.seedIntType}
//    static get randomIntType() {return Xorshift128IntType.randomIntType}
//    get seedIntType() {return this.constructor.seedIntType}
//    get randomIntType() {return this.constructor.randomIntType}
    constructor(...args){// 1/0/0/0 ~ 4294967295
        super(Xorshift128IntTypes);
//        super(new IntType(128), new IntType(32));
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
class Xorshift128p extends Prng {
//    static get seedIntType() {return new IntType(128)}
//    static get randomIntType() {return new IntType(64)}
//    static get seedIntType() {return Xorshift128pIntType.seedIntType}
//    static get randomIntType() {return Xorshift128pIntType.randomIntType}
//    get seedIntType() {return this.constructor.seedIntType}
//    get randomIntType() {return this.constructor.randomIntType}
    constructor(...args) {//seeds:new Uint32Array(4)
        super(Xorshift128pIntTypes);
//        super(new IntType(128), new IntType(64));
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
// new Range(0,99) 0..49..99
// new Range(100)  0..49..99
// new Range(-100) -50..0..49
// new Range(-101) -50..0..50
class Range {// 整数範囲。値間の差は必ず1で連続する。
    constructor(min, max, threshold) {
        this.v = [min,max];
        if (threshold) {this.t = threshold} else {this.tr = 0.5}
//        this._t = threshold;
//        this._tr = 0.5;
//        this.t = threshold;
//        this.t = threshold ?? 0===(min+max) ? 0 : Math.floor((min+max)/2);
    }
    get m() {return this._m}// 最小値
    get M() {return this._M}// 最大値
    set m(v) {if(this.isValid(v)){this._m=v}}
    set M(v) {if(this.isValid(v)){this._M=v}}
    get v() {return [this._m, this._M]}// [最小値,最大値]
    set v(V) {
        if (Array.isArray(V) && 2===V.length && V.every(v=>this.isValid(v)) && V[0]<V[1]) {this.m=V[0]; this.M=V[1];}
        else {throw new TypeError(`vの値は[min,max]のようなNumber.isSafeInteger()な数を二個持つ配列であるべきです。各数の差は1以上あり昇順であるべきです。`)}
    }
    get t() {return this._t}// 閾値
    //set t(v) {if (this.isValid(v) && this.m<=v && v<=this.M){this._t=v}else{throw new TypeError(`tはm〜Mであるべきです。`)}}
    set t(v) {
             if (undefined===v || null===v) {this._t = (0===(this.m+this.M) ? 0 : Math.floor((this.m+this.M)/2))}//中央点
        else if (this.isValid(v) && this.m<=v && v<=this.M){this._t=v}//指定値
        else {throw new TypeError(`tはm〜Mであるべきです。undefined/nullなら中央値にします。`)}
//        this._tr = this._t / this.l;
    }
    get l() {return Math.abs(this.m - this.M)+1}// 長さ length,size,width
    //get tr() {return this.t / this.l} // 長さ比 0<=tr<1
    get tr() {return this._tr} // 長さ比 0<=tr<1
    set tr(v) {
        //if (0<=v && v<=1) {this._tr = v; this.t=Math.floor(v*this.l);}
        if (0<=v && v<=1) {this._tr = v; this.t=Math.floor((0===(this.m+this.M) ? 0 : Math.floor((this.m+this.M)*v)));}
        else {throw new TypeError(`trは0〜1のNumber型であるべきです。`)}
    }
    toIndex(v) {// v=min〜maxの範囲内の値を渡された時の0〜length-1整数値を返す
        if (this.isValid(v) && this.m<=i && i<=this.M) {return v + Math.abs(this.m)}
        else{throw new TypeError(`vは${this.m}〜${this.M}迄の整数であるべきです。`)}
    }
    fromIndex(i) { // i=0〜length-1の範囲内の値を渡された時のmin〜max整数値を返す
        //if (this.isValid(v) && 0<i && i<this.l) {return this.m + i}
        //if (this.isValid(v)) {return 0<i && i<this.l ? this.m + i : this.M + i}
//             if (this.isValid(v) && 0<=i) {return this.m + (i % this.l)}
//        else if (this.isValid(v) && i<0) {return this.M + (i % this.l)}
//        if (this.isValid(v)) {return  0<=i ? (this.m + (i % this.l)) : (this.M + (i % this.l))}
        if (this.isValid(i)) {return (0<=i ? this.m : this.M) + (i % this.l)}
        else{throw new TypeError(`iは0〜${this.l-1}迄の整数または負数であるべきです。`)}
    }
    isValid(v) {if(Number.isSafeInteger(v)){return true}else{throw new TypeError(`Number.isSafeInteger(v)であるべきです。`)}}
}
class Range2 extends Range {// lengthが偶数であり必ず2で割れて前者と後者が同数だけある。最小値はゼロ。
    constructor(length) {
        if (length<2 || 0!==length%2){throw new TypeError(`lengthは必ず2で割り切れる偶数の正数であるべきです。`)}
        super(0,length-1);
    }
}
class Range3 extends Range {// lengthが奇数であり必ず中点がゼロで前者が負数、後者が正数になる
    constructor(length) {
        if (length<3 || 0===length%2){throw new TypeError(`lengthは必ず2で割り切れない奇数の正数であるべきです。`)}
        super(Math.floor(length/2)*-1,Math.floor(length/2),0);
    }
}
class Randomable {// Number(整数(0〜length-1 / min〜max)/小数(0≦r<1)), Booleanを返す
    constructor(range) {
        this._range = range instanceof Range ? range : new Range(1,6);
    }
    get prng() {return null}
    get range() {return this._range}
    //get r() {return this._prng.r}//0<=r<1
    get r() {return 0.5}//0<=r<1
    get idx() {return Math.floor(this.r * this._range.l)}//0〜length-1
    get i() {return this._range.fromIndex(this.idx)}//min〜max
    get b() {return this.r <= this._range.tr}//false/true
    get v() {
        const r = this._prng.r;
        const idx = Math.floor(r * this._range.l);
        const i = this._range.fromIndex(idx);
        const b = r <= this._range.tr;
        return {r:r, idx:idx, i:i, b:b};
    }
}
class SeedRandom extends Randomable {
    constructor(range, prng) {
        super(range);
        this._prng = prng instanceof Prng ? prng : new Xorshift128p();
    }
    get prng() {return this._prng}
    get r() {return this._prng.r}//0<=r<1
    /*
    get range() {return this._range}
    get idx() {return Math.floor(this.r * this._range.l)}//0〜length-1
    get i() {return this._range.fromIndex(this.idx)}//min〜max
    get b() {return this.r <= this._range.tr}//false/true
    get v() {
        const r = this._prng.r;
        const idx = Math.floor(r * this._range.l);
        const i = this._range.fromIndex(idx);
        const b = r <= this._range.tr;
        return {r:r, idx:idx, i:i, b:b};
    }
    */
}
/*
class Candidate {
    constructor(values) {// [w,w,...] / [{i:i, w:w, q:q},...]
        if (Array.isArray(values)) {
            if (values.every(v=>Number.isSafeInteger(v) && 0<=v) && !values.every(v=>v===0)) {// weights
                this._v = values.map((v,i)=>({i:i, w:v}))
            } 
            // [{i:i, w:w, q:q},...] i,wは必須。qは有限数にしたい場合のみ保持させる。
            //else if (values.every(v=>'i w q'.split(' ').every(n=>v.hasOwnProperty(n) && Number.isSafeInteger(v[n])) && 0<=v.w)) {
            else if (values.every(v=>'i w'.split(' ').every(n=>v.hasOwnProperty(n) && Number.isSafeInteger(v[n])) && 0<=v.w)) {
                for (let v of values) {// 不正なqを削除（無限にする）
                    const V = (v.hasOwnProperty('q') ? (Number.isSafeInteger(v.q) && 0<=v.q ? v.q : null) : undefined);
                    if (null===V) {console.warn(`qが不正値のため削除し無限にします。:{i:${v.i}, w:${v.w}, q:${v.q}}`); delete v.q;}
                }
                this._v = values;
            }
        }
        this._v = values;
    }
}
*/

// Fastable(Default) Fasted   最速Math.random() 断食(種不要)
// Seedable          Seeded   種付与可
// Securable         Secured  暗号利用可(次値予測不可)

class FastRandom extends Randomable {// Math.random()
    constructor(range) {super(range);}
    get prng() {return Math}
    get r() {return Math.random()}//0<=r<1
    /*
    get range() {return this._range}
    get idx() {return Math.floor(this.r * this._range.l)}//0〜length-1
    get i() {return this._range.fromIndex(this.idx)}//min〜max
    get b() {return this.r <= this._range.tr}//false/true
    get v() {
        const r = this._prng.r;
        const idx = Math.floor(r * this._range.l);
        const i = this._range.fromIndex(idx);
        const b = r <= this._range.tr;
        return {r:r, idx:idx, i:i, b:b};
    }
    */
}
class SecureRandom extends Randomable {// crypto.getRandomValues(array)
    constructor(range) {super(range);}
    get prng() {return crypto}
    get #raw() { // 0〜0xFFFFFFFF
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0];
    }
    get r() {return this.#raw / 0x100000000} //0<=r<1
    /*
    get range() {return this._range}
    get idx() {return Math.floor(this.r * this._range.l)}//0〜length-1
    get i() {return this._range.fromIndex(this.idx)}//min〜max
    get b() {return this.r <= this._range.tr}//false/true
    get v() {
        const r = this._prng.r;
        const idx = Math.floor(r * this._range.l);
        const i = this._range.fromIndex(idx);
        const b = r <= this._range.tr;
        return {r:r, idx:idx, i:i, b:b};
    }
    */
}
class Random {
    static of (range, ...args) {
             if (0===args.length) {return FastRandom(range)}
        else if (1===args.length) {
            if (true===args[0]) {return new SecureRandom(range)}
            else if (args[0] instanceof Prng) {return new SeedRandom(range, args[0])}
        }
        throw new TypeError(`引数は(range)/(range,true)/(range,prng)の3パターンのみ有効です。rangeのみならFastRandom、trueがあればSecureRandom、PrngならSeedRandomを返します。`)
    }
}
class Lottery {// 抽選（候補となる配列からランダムに抽出する。無限／有限、割合）
    constructor(candidates, random) {
        if (!(random instanceof Randomable)) {random = new FastRandom()}
//        if (!(random instanceof Random)) {random = new Random(new Xorshift128p(), new Range(0,1))}
//    constructor(random, candidates) {
//        if (!(random instanceof Random)) {throw new TypeError(`第一引数はRandomインスタンスであるべきです。`)}
        this._random = random;
//        this._candidates = candidates; // [w,w,...] / [{i:i, w:w, q:q},...]
        this._candidates = this.#fromCandidates(candidates); // [w,w,...] / [{i:i, w:w, q:q},...]
    }
    /*
    constructor(random, quantity, isFinitie=false) {
        this._random = random;
        //[3,1,7,0,-1] [{i:i, w:w, q:q},...]
        // 1<=w q=0:永遠に出ない q=-1:永遠に出る q<=1:0になるまで出る
        this._quantity = quantity; 
        this._isFinitie = !!isFinitie;
        if (!(random instanceof Random)) {throw new TypeError(`第一引数はRandomインスタンスであるべきです。`)}
        if (!(Array.isArray(quantity) && quantity.every(q=>Number.isSafeInteger(q) && 0<=q) && !quantity.every(q=>q===0))) {throw new TypeError(`第ニ引数は全要素が正整数の配列であるべきです。その合計値は1以上であるべきです。`)}
    }
    */
    get prng() {return this._prng}
    get candidates() {return this._candidates}
//    get quantity() {return this._quantity}
//    get isFinitie() {return this._isFinitie}
    get draw() {
        const Cs = this.#Cs();
        if (0===Cs.length) {return -1}
        //const S = this.#quantitySum(weights)
        const S = this.#weightSum(Cs)
        //this._random.range.v = [0, Cs.length-1];
        //this._random.range.v = [0, S-1];
        const c = this.#c(Cs, S);
        console.log('c:',c)
        //if (this._isFinitie) {if(0<this._quantity[c]){this._quantity[c]--} this._quantity[c]--; if(-1)}
        if (this._candidates[c].hasOwnProperty('q') && 0<this._candidates[c].q) {this._candidates[c].q--}
        return Cs[c].i;
    }
    *draws(N) {
        if (Number.isSafeInteger(N) && 0<N) {
            for (let i=0; i<N; i++) {yield this.draw}
        } else {throw new TypeError(`引数は回数でありNumber.isSafeInteger(N)な自然数のみ有効です。`)}
    }
    #c(Cs, S) {// 候補の添字を一つ返す
        //const V = RndInt.pieces(S); // 0〜S-1
        this._random.range.v = [0, S-1]; // 0〜S-1
        const V = this._random.i;
        console.log(Cs, S, V)
        for (let i=0; i<Cs.length; i++) {
            const Q = Cs.slice(0,i+1).reduce((s,v,i)=>s+v.w, 0);
            if (V < Q) {return i}
        }
        throw new Error(`このコードは実行されないはず。もし実行されたら論理エラー。ロジックを組み直すべき。`)
    }
    #Cs(){return this._candidates.filter(c=>c.hasOwnProperty('q') && 0===c.q ? false : true);}// Candidations [[i,q],...,[i,q]]
//    #Cs(){return this._quantity.map((q,i)=>({i:i, q:q})).filter(v=>0<v.q);}// Candidations [[i,q],...,[i,q]]
//    static #Cs(Ws){return Ws.map((w,i)=>({i:i, w:w})).filter(v=>0<v.w);}// Candidations [[i,w],...,[i,w]]
    #weightSum(Cs) {
        //const S = this._quantity.reduce((s,v,i)=>s+v, 0);
        const S = Cs.reduce((s,c,i)=>s+c.w, 0);
        if (S<1) {throw new TypeError(`wの合計は1以上になるべきです。`)}
        return S;
    }
    #fromCandidates(values) {// [w,...] / [{i:i, w:w (, q:q)},...]
        if (Array.isArray(values)) {
            if (values.every(v=>Number.isSafeInteger(v) && 0<=v) && !values.every(v=>v===0)) {// weights
                return values.map((v,i)=>({i:i, w:v}))
            } 
            // [{i:i, w:w, q:q},...] i,wは必須。qは有限数にしたい場合のみ保持させる。
            //else if (values.every(v=>'i w q'.split(' ').every(n=>v.hasOwnProperty(n) && Number.isSafeInteger(v[n])) && 0<=v.w)) {
            else if (values.every(v=>'i w'.split(' ').every(n=>v.hasOwnProperty(n) && Number.isSafeInteger(v[n])) && 0<=v.w) && !values.every(v=>v.w===0)) {
                values.map((v,i)=>{
                    const V = (v.hasOwnProperty('q') ? (Number.isSafeInteger(v.q) && 1<=v.q ? v.q : null) : undefined);
                    if (null===V) {console.warn(`qが不正値のため削除しました。:{i:${v.i}, w:${v.w}, q:${v.q}}`); delete values[i].q;}
                });
                const s = new Set(values.map(v=>v.i));
                if (s.size!==values.length) {throw new TypeError(`iが重複しています。重複しない値を設定してください。`)}
                return values;
            }
        }
        throw new TypeError(`candidatesは[w,...]か[{i,w(,q)},...]な配列であるべきです。wはweightであり1以上の整数、iはint/indexで0以上の整数、qはquantityで1以上の整数です。qは数量を有限にしたい場合のみ任意で指定します。`)
    }
}
window.I32 = I32;
window.R32 = R32;

window.Random = Object.freeze({
    Prng: Prng,
    prngs: {// 疑似乱数生成器群
        Xorshift32: Xorshift32,
        Xorshift128: Xorshift128,
        Xorshift128p: Xorshift128p,
    },
    Range: Range,
    Range2: Range2,
    Range3: Range3,
    Randomable: Randomable, // 一様分布 uniform distribution
    Fasted: FastRandom,     // Math.random()
    Secured: SecureRandom,  // crypto.getRandomValues(ary)
    Seeded: SeedRandom,     // Seed.of(IntType.get(32,false))
    Lottery: Lottery,       // 偏った分布 Biased distribution
    of: function(...args) {
             if (0===args.length) {return new FastRandom()}
        else if (1===args.length) {
            if (args[0] instanceof Range) {return new FastRandom(...args)}
            else if (true===args[0]) {return new SecureRandom()}
            else if (args[0] instanceof Prng) {return new SeedRandom(null, args[0])}
            else if (Array.isArray(args[0])) {return new Lottery(args[0])}
        }
        else if (1<args.length) {
            if (args[0] instanceof Range) {
                if (true===args[1]) {return new SecureRandom(args[0])}
                else if (args[1] instanceof Prng) {return new SeedRandom(...args)}
            }
            else if (Array.isArray(args[0]) && args[1] instanceof Randomable) {return new Lottery(...args);}
        }
        throw new TypeError(`引数は()/(range)/(range,true)/(range,prng)/(candidates(,randomable))の5パターンのみ有効です。無しかrangeのみならFasted、trueがあればSecured、PrngならSeeded、candidatesならLotteryを返します。`)
    },


    /*
    of: function(range, ...args) {
             if (0===args.length) {return new FastRandom(range)}
        else if (1===args.length) {
            if (true===args[0]) {return new SecureRandom(range)}
            else if (args[0] instanceof Prng) {return new SeedRandom(range, args[0])}
        }
        else if (1<args.length && Array.isArray(args[0])) {return new Lottery(...args);}
        throw new TypeError(`引数は(range)/(range,true)/(range,prng)の3パターンのみ有効です。rangeのみならFastRandom、trueがあればSecureRandom、PrngならSeedRandomを返します。`)
    },
    */
});
/*
window.PRNG = {
    Prng: Prng,
    Xorshift32: Xorshift32,
    Xorshift128: Xorshift128,
    Xorshift128p: Xorshift128p,
    Range: Range,
    Range2: Range2,
    Range3: Range3,
    Randomable: Randomable,
    SeedRandom: SeedRandom,
    FastRandom: FastRandom,
    SecureRandom: SecureRandom,
    Lottery: Lottery,
    of: function(range, ...args) {
             if (0===args.length) {return FastRandom(range)}
        else if (1===args.length) {
            if (true===args[0]) {return new SecureRandom(range)}
            else if (args[0] instanceof Prng) {return new SeedRandom(range, args[0])}
        }
        throw new TypeError(`引数は(range)/(range,true)/(range,prng)の3パターンのみ有効です。rangeのみならFastRandom、trueがあればSecureRandom、PrngならSeedRandomを返します。`)
    },
};
*/
/*
window.Range = Range;
window.Range2 = Range2;
window.Range3 = Range3;
window.Random = Random;
window.Lottery = Lottery;
*/
})();
