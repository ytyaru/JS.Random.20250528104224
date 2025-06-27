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
            else if ((-2)**31<=n && n<0) {return (0x100000000-(n*-1))/0x100000000} // signed int 32
            else if (0xFFFFFFFF<n) {return (n & 0xFFFFFFFF)/0x100000000}
            else if (n<(-2)**31) {return ((n & 0xFFFFFFFF)+0x100000000)/0x100000000}
        }
        throw new TypeError(`引数nはNumber.isSafeInteger(n)な値であるべきです。:${n}:`,n)
    }
    static fromNs(ns) {
        const rs = ns.map((n,i)=>{[...new Array(i+1)].map(_=>n/=0x100000000);return n;});
        return rs.reduce((s,v,i)=>s+v < 1 ? s+v : s,0);
    }
}
class IntTypeSet { // pseudo random numbers generator 疑似乱数生成器
    constructor(s, r) {
        this._s = s; this._r = r;
        if (![s,r].every(v=>v instanceof IntType)) {throw new TypeError(`s,rはIntType型インスタンスであるべきです。`)}
    }
    get seedIntType() {return this._s}
    get randomIntType() {return this._r}
}
const Xorshift32IntTypeSet = new IntTypeSet(new IntType(32), new IntType(32));
const Xorshift128IntTypeSet = new IntTypeSet(new IntType(128), new IntType(32));
const Xorshift128pIntTypeSet = new IntTypeSet(new IntType(128), new IntType(64));
class Prng { // pseudo random numbers generator 疑似乱数生成器
    constructor(intTypes) {
        if (!(intTypes instanceof IntTypeSet)) {throw new TypeError(`引数はIntTypeSet型インスタンスであるべきです。`)}
        this._intTypes = intTypes;
    }
    static get seedIntType() {return this._intTypes.seedIntType}
    static get randomIntType() {return this._intTypes.randomIntType}
    get seedIntType() {return this.constructor.seedIntType}
    get randomIntType() {return this.constructor.randomIntType}
}
class Xorshift32 extends Prng {
    constructor(seed) {
        super(Xorshift32IntTypeSet);
//        console.log(seed instanceof Seed)
        this._seed = seed instanceof Seed ? seed : (Seed.of((Number.isSafeInteger(seed) && 0!==seed||('string'===typeof seed || seed instanceof String)) ? seed : Date.now()));
//        console.log(this._seed)
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
    get i() {// 単一整数Number型 bitSize<=53 ? Number : BigInt
        const b = this.b;
        return 53 < this._type.bitSize ? b : Number(b);
    }
    get b() {return BigInt.fromU32Numbers(...this._u32a)}// 単一整数BigInt型
    get ns() {return this._u32a}// 複数u32整数 Number配列
    get u32a() {return new Uint32Array(this._u32a)}// Uint32Array
    get r() {return R32.fromNs(this.ns);}// 0.0≦r＜1.0 浮動少数 Number
}
class Xorshift128 extends Prng {
    constructor(...args){// 1/0/0/0 ~ 4294967295
        super(Xorshift128IntTypeSet);
        this._v = new UintValues(128, ...args);
//        console.log(this._v)
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
    constructor(...args) {//seeds:new Uint32Array(4)
        super(Xorshift128pIntTypeSet);
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
class Range {//連続有限整数範囲(指定した始点〜終点までの整数。前後の値差は必ず1であり連続している)
    static of(...args) {return new Range(...args)}
    constructor(...args) {
        const L = args.length;
        if (2 < L){throw new TypeError(`引数は()/(length)/(min,max)の3パターンのみ有効です。`)}
        this.v = 0===L ? [1,6] : (1===L ? this.#getMinMax(args[0]) : (2===L ? [...args] : null));
    }
    #getMinMax(length) {
        if (Number.isSafeInteger(length)) {
            if (1<length) {return [0, length-1]}
            else if (length<-1){
                const H = Math.trunc(length/2);
                if (0===Math.abs(length%2)) {return [H, (H*-1)-1]}// ゼロは正数として扱えば負数と同数になる
                else {return [H, (H*-1)]} // ゼロは正負どちら側でもない値として扱えば負数と同数になる
            }
        }
        throw new TypeError(`引数はNumber.isSafeInteger()で2以上か-2以下の整数であるべきです。正数なら0〜引数-1迄、負数で奇数なら0を中点とし0を除外した各数を正数と負数が同数になるような範囲にします。負数で偶数なら0を正数として扱い半数にします。`)
    }
    get m() {return this._m}// 最小値
    get M() {return this._M}// 最大値
    set m(v) {if(this.#isValid(v)){this._m=v}}
    set M(v) {if(this.#isValid(v)){this._M=v}}
    get v() {return [this._m, this._M]}// [最小値,最大値]
    set v(V) {
        if (Array.isArray(V) && 2===V.length && V.every(v=>this.#isValid(v)) && V[0]<V[1]) {this.m=V[0]; this.M=V[1];}
        else {throw new TypeError(`vの値は[min,max]のようなNumber.isSafeInteger()な数を二個持つ配列であるべきです。各数の差は1以上あり昇順であるべきです。`)}
    }
    get l() {return Math.abs(this.m - this.M)+1}// 長さ length,size,width
    toIndex(v) {// v=min〜maxの範囲内の値を渡された時の0〜length-1整数値を返す
        this.within(v);
             if (this.m < 0 && this.M < 0) {return Math.abs(this.m)-Math.abs(v)}  // 負数〜負数
        else if (this.m < 0 && 0 <= this.M) {return v<0 ? Math.abs(this.m)+v : v+Math.abs(this.m)} // 負数〜正数
        else {return v-this.m} // 正数〜正数
    }
    fromIndex(i) {// i=0〜length-1の範囲内の値を渡された時のmin〜max整数値を返す
        if (this.#isValid(i)) {return (0<=i ? this.m : this.M) + (i % this.l)}
        else{throw new RangeError(`iは0〜${this.l-1}迄の整数または負数であるべきです。:${i}`)}
    }
    fromRate(r) {if (this.#isRate(r)) {return this.l * r}}// 0〜1の値を渡された時のmin〜max整数値を返す
    toRate(v) {if (this.within(v)) {return v / this.l;}}// min〜maxを渡された時の0〜1を返す
    #isValid(v) {if(Number.isSafeInteger(v)){return true}else{throw new TypeError(`Number.isSafeInteger()であるべきです。:${v}`)}}
    #isNum(v){if('number'===typeof v){return true}else{throw new TypeError(`Number型であるべきです。:${v}`)}}
    #isRate(v){if(!this.#isNum(v) || r<0 || 1<r){throw new RangeError(`0〜1迄の少数であるべきです。:${v}`)}else{return true}}
    within(v){if(!this.#isValid(v) || v<this.m || this.M<v){throw new RangeError(`${this.m}〜${this.M}迄の整数であるべきです。:${v}`)}else{return true}}
}
// Fastable(Default) Fasted   最速Math.random() 断食(種不要)
// Seedable          Seeded   種付与可
// Securable         Secured  暗号利用可(次値予測不可)
class Randomable {// Number(整数(0〜length-1 / min〜max)/小数(0≦r<1)), Booleanを返す
    constructor(range) {
        this._range = range instanceof Range ? range : new Range(1,6);
    }
    get prng() {return null}
    get range() {return this._range}
    get r() {return 0.5}//0<=r<1
    get idx() {return Math.floor(this.r * this._range.l)}//0〜length-1
    get i() {return this._range.fromIndex(this.idx)}//min〜max
    get b() {return 0.5<=this.r}//false/true
    get v() {
        const r = this._prng.r;
        const idx = Math.floor(r * this._range.l);
        const i = this._range.fromIndex(idx);
        const b = r <= this._range.tr;
        return {r:r, idx:idx, i:i, b:b};
    }
    p(r=0.5) {// 指定した確率で真を返す。r:閾値
        if ('number'!==typeof r) {throw new TypeError(`引数は0〜1迄の少数であるべきです。`)}
        return r<=this.r;
    }
    int(...args) {// 指定した範囲の数のうちどれか一つを等確率で返す
        const R = Range.of(...args);
        return (this.r * (R.M+1)) + R.m;
    }
}
class SeedRandom extends Randomable {
    constructor(range, prng) {
        super(range);
        this._prng = prng instanceof Prng ? prng : new Xorshift128p();
    }
    get prng() {return this._prng}
    get r() {return this._prng.r}//0<=r<1
}
class FastRandom extends Randomable {// Math.random()
    constructor(range) {super(range);}
    get prng() {return Math}
    get r() {return Math.random()}//0<=r<1
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
}
class Candidate {//[{i:i,w:w(,q:q)},...]
    from(...args) {//([w,...]) / ([w,...],true) / ([w,[w,q]],...) / ([[i,w],[i,w,q],...]) / ([{i:i,w:w},{i:i,w:w,q:q},...])
        if (1===args.length || (2===args.length && false===args[1])) {
            for (let m of 'fromWeights fromMix fromArray fromObjects'.split(' ')) {
//                console.log(m, this[m])
                const v = this[m](...args);
                if (undefined!==v) {return v}
            }
        }
        // ([w,...],true)
//        else if (2===args.length && true===args[1] && Array.isArray(args[0]) && args[0].every(q=>Number.isSafeInteger(q) && 0<q)) {return args[0].map((v,i)=>Candidate.#mkObj(i,v,v))}
//        else if (2===args.length && true===args[1]) {return this.fromQuantity(args[0])}
        else if (2===args.length && true===args[1]) {
            const v = this.fromQuantity(...args);
            if (undefined!==v) {return v}
        }
        throw new TypeError(`candidatesの引数は([w,...]) / ([w,...],true) / ([w,[w,q]],...) / ([[i,w],[i,w,q],...]) / ([{i:i,w:w},{i:i,w:w,q:q},...])の5パターンのみ有効です。wはweightであり1以上の整数、iはint/indexで0以上の整数、qはquantityで1以上の整数です。qは数量を有限にしたい場合のみ任意で指定します。wは必須であり出現率を表す比重、iはLottery.drawで返す値であり省略時は0から始まる連番になります。`);
    }
    fromWeights(weights) {
        if (Array.isArray(weights) && weights.every(w=>Number.isSafeInteger(w) && 0<=w) && !weights.every(w=>w===0)) {return weights.map((v,i)=>Candidate.#mkObj(i,v))}
    }
    fromQuantity(quantity) {
        if (Array.isArray(quantity) && quantity.every(q=>Number.isSafeInteger(q) && 0<q)) {return quantity.map((v,i)=>Candidate.#mkObj(i,v,v))}
    }
    fromMix(array) {
        if (Array.isArray(array) && array.every(a=>(Number.isSafeInteger(a) && 0<=a)||(Array.isArray(a) && 2===a.length && a.every(v=>Number.isSafeInteger(v) && 0<=v))) && !array.every(a=>a===0)) {return array.map((v,i)=>Array.isArray(v) ? Candidate.#mkObj(i,v) : Candidate.#mkObj(...v))}
    }
    static #mkObj(...A) {return Object.seal(A.length<3 ? ({i:A[0],w:A[1]}) : ({i:A[0],w:A[1],q:A[2]}))}
    fromArray(array) {
        if (Array.isArray(array) && array.every(a=>Array.isArray(a) && 2<=a.length && a.every(v=>Number.isSafeInteger(v) && 0<=v)) && !array.every(a=>a[1]===0) && (new Set(array.map(a=>a[0]))).size===array.length) {return array.map((v,i)=>Candidate.#mkObj(...v))}
    }
    static #isPrimitive(v) {return v !== Object(v)}
    static #isCls(v) {return (('function'===typeof v) && (!!v.toString().match(/^class /)))}
    static #isObj(v) {
        if (this.#isPrimitive(v)){return false}
        const P = Object.getPrototypeOf(v)
        return null!==v && 'object'===typeof v && '[object Object]'===Object.prototype.toString.call(v) && !(P && P.hasOwnProperty('constructor') && this.#isCls(P.constructor));
    }
    fromObjects(objs) {
        if (Array.isArray(objs) && objs.every(o=>Candidate.#isObj(o) && 'i w'.split(' ').every(o=>o.hasOwnProperty(n) && Number.isSafeInteger(o[n])) && 0<=o[k]) && !objs.every(v=>v.w===0)) {
            objs.map((v,i)=>{
                const V = (v.hasOwnProperty('q') ? (Number.isSafeInteger(v.q) && 1<=v.q ? v.q : null) : undefined);
                if (null===V) {console.warn(`qが不正値のため削除しました。:{i:${v.i}, w:${v.w}, q:${v.q}}`); delete objs[i].q;}
            });
            const s = new Set(objs.map(v=>v.i));
            if (s.size!==objs.length) {throw new TypeError(`iが重複しています。重複しない値を設定してください。`)}
            return Object.seal(objs);
        }
    }
    static of(...args) {return new Candidate(...args)}
    constructor(...args) {// ([w,...]) / ([w,...],true) / ([w,[w,q]],...) / ([[i,w],[i,w,q],...]) / ([{i:i,w:w},{i:i,w:w,q:q},...])
//        console.log(args)
        this._v = this.from(...args);
        const isFinite = 1<args.length && !!args[1];
        this._isAllInfinity = this._v.every(o=>!o.hasOwnProperty('q'));
        this._isAllFinite = isFinite || this._v.length===this.finiteds.length;
        this._hasFinite = isFinite || -1<this._v.findIndex(o=>o.hasOwnProperty('q'));
        this._backupV = this._hasFinite ? JSON.parse(JSON.stringify(this._v)) : null;
//        console.log('this._isAllInfinity:', this._isAllInfinity)
    }
    get v() {return this._v}
    // 候補全体の状態
    get isInfinity() {return this._isAllInfinity}
    get isFinite() {return this._isAllFinite}
    get hasFinite() {return this._hasFinite}
    get isFullStock() {const B=0===this.banneds.length; return this.isInfinity ? B : 0===this.notExistFiniteds.length && B;}//有限数の品があるとき品数は初期値以上であるか
    get hasOutOfStock() {return 0<this.notExistFiniteds.length}//品切れしたものが一つ以上ある
    get isOutOfStock() {return 0<this.notExistFiniteds.length}//有限数の品が全て品切れした
    get isSoldOut() {return 0===this.infiniteds.length && 0===this.existFiniteds.length}//一つの品も出せない状態か
    get totalWeight() {return this._v.reduce((s,o,i)=>s+o.w, 0)}
    // 部分候補の取得
    get existeds() {return this._v.filter(o=>!(o.hasOwnProperty('q') && 0===o.q))}// 在庫があるもの（無限・有限不問）
    get infiniteds() {return this._v.filter(o=>!o.hasOwnProperty('q'))}// 無限にあるもの
    get finiteds() {return this._v.filter(o=>o.hasOwnProperty('q'))}// 有限だけあるもの
    get existFiniteds() {return this.finiteds.filter(o=>0<o.q)}// 有限かつ1以上あるもの
    get notExistFiniteds() {return this.finiteds.filter(o=>0===o.q)}// 有限で品切れたもの
    get banneds() {return this._v.filter(o=>0===o.w)} // weightが0であり絶対出現しないもの
    reset() {// 品切れしたものを補充し、禁止したものを解禁する(quantity=0で品切れたものを回復し、weight=0でBANしたものを元に戻す)
        for (let i=0; i<this._backupV.length; i++) {
            this._v[i].w = this._backupV[i].w;
            this._v[i].q = this._backupV[i].q;
        }
    }
    reQ() {for (let i=0; i<this._backupV.length; i++) {this._v[i].q = this._backupV[i].q;}}//quantityを初期値に
    reW() {for (let i=0; i<this._backupV.length; i++) {this._v[i].w = this._backupV[i].w;}}//weightsを初期値に戻す
}

// InfinityLottery  全候補無限
// FiniteLottery    全候補有限（候補枯渇時：不正値を返す(-1,null,NaN)／例外発生／補充(初期値と同じ／再設定要請(例外発生/関数))）
// MixLottery       一部候補有限
// Lottery          上記三つを引数次第でルーティングする
// .of(...args)     ([w,...])/([w,...],true)/ ([w,[w,q]])/([i,w],[i,w,q],...)/[{i:i,w:w},{i:i,w:w,q:q},...]
class Lottery {// 抽選（候補となる配列からランダムに抽出する。無限／有限、割合）
    // (candidates, isFinite) / (candidates, random) / (candidates, isFinite, random)
    //constructor(candidates, random) {
    constructor(...args) {
        let [C,F,R] = [null,false,null];
             if (1===args.length) {C=args[0];}
        else if (2===args.length) {C=args[0]; F=args[1]; R=args[1];}
        else if (3 <=args.length) {C=args[0]; F=args[1]; R=args[2];}
        this._candidate = Candidate.of(C, 'boolean'===F ? F : false);
        this._random = (args[1] instanceof Randomable) ? R : new FastRandom();
        /*
        if (!(random instanceof Randomable)) {random = new FastRandom()}
        this._random = random;
//        this._candidate = this.#fromCandidates(candidates); // [w,w,...] / [{i:i, w:w, q:q},...]
        this._candidate = Candidate.of(candidates, isFinite);
        */
    }
    get prng() {return this._prng}
    get candidate() {return this._candidate}
    get draw() {
//        const Cs = this.#Cs();
        const Cs = this._candidate.existeds;
        if (0===Cs.length) {return -1}
//        const S = this.#weightSum(Cs)
        const S = this._candidate.totalWeight;
        const c = this.#c(Cs, S);
//        console.log('c:',c)
        if (this._candidate.v[c].hasOwnProperty('q') && 0<this._candidate.v[c].q) {this._candidate.v[c].q--}
        return Cs[c].i;
    }
    *draws(N) {
        if (Number.isSafeInteger(N) && 0<N) {
            for (let i=0; i<N; i++) {yield this.draw}
        } else {throw new TypeError(`引数は回数でありNumber.isSafeInteger(N)な自然数のみ有効です。`)}
    }
    #c(Cs, S) {// 候補の添字を一つ返す
        this._random.range.v = [0, S-1]; // 0〜S-1
        const V = this._random.i;
//        console.log(Cs, S, V)
        for (let i=0; i<Cs.length; i++) {
            const Q = Cs.slice(0,i+1).reduce((s,v,i)=>s+v.w, 0);
            if (V < Q) {return i}
        }
        throw new Error(`このコードは実行されないはず。もし実行されたら論理エラー。ロジックを組み直すべき。`)
    }
    /*
    #Cs(){return this._candidate.filter(c=>c.hasOwnProperty('q') && 0===c.q ? false : true);}// Candidations [[i,q],...,[i,q]]
    #weightSum(Cs) {
        const S = Cs.reduce((s,c,i)=>s+c.w, 0);
        if (S<1) {throw new TypeError(`wの合計は1以上になるべきです。`)}
        return S;
    }
    #fromCandidates(values) {// [w,...] / [{i:i, w:w (, q:q)},...]
        if (Array.isArray(values)) {
            if (values.every(v=>Number.isSafeInteger(v) && 0<=v) && !values.every(v=>v===0)) {// weights
                return values.map((v,i)=>({i:i, w:v}))
            } 
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
    */
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
    Range: Range, // 整数範囲
    Randomable: Randomable, // 一様分布 uniform distribution
    Fasted: FastRandom,     // Math.random()
    Secured: SecureRandom,  // crypto.getRandomValues(ary)
    Seeded: SeedRandom,     // Seed.of(IntType.get(32,false))
    Candidate: Candidate,   // 抽選候補
    Lottery: Lottery,       // 偏った分布 Biased distribution 抽選
    of: function(...args) { // Randomable生成関数
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
            //else if (Array.isArray(args[0]) && args[1] instanceof Randomable) {return new Lottery(...args);}
            //else if (Array.isArray(args[0])) {return new Lottery(...args);}
            else if (Array.isArray(args[0])) {return new Lottery(...args);}
        }
        throw new TypeError(`引数は()/(range)/(range,true)/(range,prng)/(candidates(,randomable))の5パターンのみ有効です。無しかrangeのみならFasted、trueがあればSecured、PrngならSeeded、candidatesならLotteryを返します。`)
    },
});
})();
