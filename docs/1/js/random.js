(function(){
// 公開クラス Random
// 拡張メソッド
//   Array            sec()
//   Array.prototype  shuffle(), toShuffled()
//   Number
// 内部クラス         Is,Rnd[Real|Bool|Int],Sequence,Deck,Lottery
class Is {
    static safeI(v){return Number.isInteger(v) && Number.MIN_SAFE_INTEGER <= v && v <= Number.MAX_SAFE_INTEGER}
    static P(v){return this.safeI(v) && 0 <= v} // 正の整数(0〜N)
    static N(v){return this.safeI(v) && 0 <  v} // 自然数(1〜N)
    //static R(v){return 'number'===typeof v && 0<=v && v<=1} // 実数(0〜1)
    static R(v){return Number.isFinite(v) && 0<=v && v<=1} // 実数(0〜1)
    static A(v){return Array.isArray(v)}
    static Ps(v){return this.A(v) && v.every(V=>this.P(V))}
}
class RndReal {
    static V() { // Real number 実数 0.0〜1.0
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const value = array[0] / (0xFFFFFFFF + 1); // 0.0〜1.0
        return value;
    }
}
class RndBool {
    static rate(R) { switch(R){
        case 0: return false
        case 1: return true
        default: return (RndReal.V() <= R)
    } }
    static fraction(N, M) {return this.rate(N/M)}
}
class RndInt {
    static int(R) {return Math.floor(RndReal.V() * R)}
    static range(N, M) {return Math.floor(RndReal.V() * (M-N+1)) + N}
}
class Sequence {
    static make(N,M) {
        if (undefined===M && Is.N(N)){return this.#make(0,N-1)}
        else if (Is.P(N) && Is.P(M)){return this.#make(N,M)}
        else if (Is.Ps(N)){return N}
        else {throw new TypeError(`Sequence.make()の引数は自然数一つか正整数二つか配列のみ有効です。自然数は0〜N-1、正整数二つはN〜Mの整数を、配列ならそれ自体を返します。`)}
    }
    static #make(N,M) {return [...new Array(M-N+1)].map((_,i)=>i)}
}
class Deck {
    static shuffle(A, isCopy=false) {
        const R = isCopy ? [...new Array(A.length)].map((_,i)=>A[i]) : A; // 配列コピー
        for (let i=R.length-1; i>0; i--) {
            let j = Math.floor(RndReal.V() * (i + 1)); // 0 から i のランダムなインデックス
            [R[i], R[j]] = [R[j], R[i]]; // 要素を入れ替えます
        }
        return R;
    }
}
// Array.seq(5)   // [0,1,2,3,4]
// Array.seq(5,1) // [1,2,3,4,5]
// [1,2,3].suffule()    //   破壊的メソッド。自分自身を無作為に並べ替えて返す。
// [1,2,3].toSuffuled() // 非破壊的メソッド。配列を複製して無作為に並べ替えて返す。
if (!('seq' in Array)){Array.seq = function(N,M) {return Sequence.make(N,M)}}
if (!('shuffle' in Array.prototype)){Array.prototype.shuffle = function(N,M) {return Deck.shuffle(this, false)}}
if (!('toShuffled' in Array.prototype)){Array.prototype.toShuffled = function() {return Deck.shuffle(this, true)}}
class Lottery {// 抽選（割合）
    // 0〜weights.length-1までの整数値を一つ返す。但しその出現率は引数の配列weightsで指定する。
    static draw(weights) {// [6,3,1] 0:6/10, 1:3/10, 2:1/10  [1,1,1] 0:1/3, 1:1/3, 2:1/3   [0,0,1] 0:0, 1:0, 2:1
        const Cs = this.#Cs(weights);
        const S = this.#weightSum(weights)
        const c = this.#c(Cs, S);
        return Cs[c].i;
    }
    static #c(Cs, S) {// 候補の添字を一つ返す
        const V = RndInt.int(S); // 0〜S-1
        for (let i=0; i<Cs.length; i++) {
            const W = Cs.slice(0,i+1).reduce((s,v,i)=>s+v.w, 0);
            if (V < W) {return i}
        }
        throw new Error(`このコードは実行されないはず。もし実行されたら論理エラー。ロジックを組み直すべき。`)
    }
    // 0〜weights.length-1までの整数値をNつ返す。但しその出現率は引数の配列weightsで指定する。
    static draws(weights, N=undefined) {
        const Cs = this.#Cs(weights);
        const S = this.#weightSum(weights)
        const cs = [...new Array(Number.isInteger(N) ? N : S)].map(_=>this.#c(Cs, S));
        return cs.map(c=>Cs[c].i);
    }
    static #Cs(Ws){return Ws.map((w,i)=>({i:i, w:w})).filter(v=>0<v.w);}// Candidations [[i,w],...,[i,w]]
    static #weightSum(Ws) {
        const S = Ws.reduce((s,v,i)=>s+v, 0);
        if (S<1) {throw new TypeError(`引数の合計は1以上になるべきです。`)}
        return S;
    }
}
class Random {
    get R() {return RndReal.V()}
    B(V=0.5, M) {// 真偽を返す。真を返す確率を引数で示す。引数一つなら0.0〜1.0、二つなら分子と分母で。
        if (undefined===M && this.#isR(V)){return RndBool.rate(V)}
        else if (this.#isN(V) && this.#isN(M)){return RndBool.fraction(V,M)}
        else {throw new TypeError(`Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`)}
    }
    I(V,M) {// 0以上の整数を返す。範囲や確率は引数で示す。(自然数):0〜自然数-1、(正数N,正数M):N〜M、([正数,...]):0〜要素数-1
        if (undefined===M && this.#isN(V)){return RndInt.int(V)}
        else if (this.#isP(V) && this.#isP(M)){return RndInt.range(Math.min(V,M),Math.max(V,M))}
        else if (this.#isPs(V)){return Lottery.draw(V)}
        else {throw new TypeError(`Random.I()の引数は自然数一つか正整数二つか配列のみ有効です。自然数は0〜V-1、正整数二つはV〜Mの整数を、同率で返します。配列なら要素値は0以上の整数のみ有効であり、その重みから出現率を算出して0〜要素数-1の整数を一つ返します。`)}
    }
    A(V,M) {
        const A = this.#isPs(V) ? V
            : ((undefined===M && this.#isN(V)) || (this.#isP(V) && this.#isP(M)))
                ? Sequence.make(V,M)
                : null;
        if (null===A) {throw new TypeError(`Random.A()の引数は(自然数)か(正数,正数)か(配列,真偽値)のみ有効です。配列なら要素値は正数(0以上の整数)のみ有効です。`)}
        return Deck.shuffle(A, this.#isA(V) ? !!M : false);
    }
    Bs(V,M,N) {return [...new Array(N)].map(_=>this.B(V,M))}
    Is(V,M,N) {return [...new Array(N)].map(_=>this.I(V,M))}
    As(V,M,N) {return [...new Array(N)].map(_=>this.A(V,M))}
    #isSafeI(v){return Number.isInteger(v) && Number.MIN_SAFE_INTEGER <= v && v <= Number.MAX_SAFE_INTEGER}
    #isP(v){return this.#isSafeI(v) && 0 <= v} // 正の整数(0〜N)
    #isN(v){return this.#isSafeI(v) && 0 <  v} // 自然数(1〜N)
    #isR(v){return 'number'===typeof v && 0<=v && v<=1} // 実数(0〜1)
    #isA(v){return Array.isArray(v)}
    #isPs(v){return this.#isA(v) && v.every(V=>this.#isP(V))}
}
class Coin {
    get v() {return RndBool.rate(0.5)}
    toss(N) {
        if (!Is.N(N)){throw new TypeError(`引数は自然数のみ有効です。`)}
        else if(1===N){return this.v}
        else {return [...new Array(N)].map(_=>this.v)}
    }
}
class DiceN {
    constructor(V,M) {this._V = V; this._M = M;}
    get v() {return RndInt.range(this._V,this._M)}
    vs(N) {
        if (!Is.N(N)){throw new TypeError(`引数は自然数のみ有効です。`)}
        else {return [...new Array(N)].map(_=>RndInt.range(1,V))}
    }
    roll(N) {
        if (!Is.N(N)){throw new TypeError(`引数は自然数のみ有効です。`)}
        else if(1===N){return RndInt.range(1,V)}
        else {return [...new Array(N)].map(_=>RndInt.range(1,V))}
    }
}
class Dice4 extends DiceN {constructor(){super(1,4)}}
class Dice6 extends DiceN {constructor(){super(1,6)}}
class Dice8 extends DiceN {constructor(){super(1,8)}}
class Dice09 extends DiceN {constructor(){super(0,9)}}
class Dice10 extends DiceN {constructor(){super(1,10)}}
class Dice12 extends DiceN {constructor(){super(1,12)}}
class Dice16 extends DiceN {constructor(){super(1,16)}}
class Dice20 extends DiceN {constructor(){super(1,20)}}
class Dice0099 extends DiceN {constructor(){super(0,99)}}
class Dice100 extends DiceN {constructor(){super(1,100)}}

// C:Cheating チーティング チート
class DiceC123 extends DiceN {constructor(){super(1,3)}}
class DiceC456 extends DiceN {constructor(){super(4,6)}}
class DiceL {
    constructor(A) {
        if (!(Is.Ps(A) && 0 < A.reduce((s,v)=>s+v,0))) {throw new TypeError(`引数は0以上の整数な配列で総和が1以上であるべきです。`)}
        this._A = A;
    }
    get v() {return Lottery.draw(this._A)+1}
    get vs() {return Lottery.draws(this._A).map(v=>v+1)}
}
class Dice6W10A extends DiceL {constructor(){super([1,1,2,2,2,2])}}
class Dice6W10B extends DiceL {constructor(){super([1,1,1,2,2,3])}}

class Roulette {// 3タイプ(アメリカン5.26%,メキシカン:7.7%,ヨーロピアン/マカオ:2.7%)
    get v() {
        const V = RndInt.range(1,38) // 1〜36、0,00(控除率（ハウスエッジ）：ハズレでありカジノ運営の総取り)
             if (37===V) {return '0'}
        else if (38===V) {return '00'}
        else             {return `${V}`}
    }
    play(bets) {

    }
    straightUp()
}
class Wheel {
    constructor(pocketLength=38) {this._length=pocketLengh;}
    spin() {return RndInt.range(1,this._length)}// 1〜36、0,00(控除率（ハウスエッジ）：ハズレでありカジノ運営の総取り)
}
class Pocket {// アメリカン・ルーレットのウィールにあるポケットとその配列
    static make(t=0) {// 0:アメリカン、他:ヨーロピアン／フレンチ／
        return .map((n,c)=>new Pocket(n,c));
    }
    // アメリカン 1〜36,0,00
    static #american() {return [[0,0],[28,2],[9,1],[26,2],[30,1],[11,2],[7,1],[20,2],[32,1],[17,2],[5,1],[22,2],[34,1],[15,2],[3,1],[24,2],[36,1],[13,2],[1,1],[00,0],[27,1],[10,2],[25,1],[29,2],[12,1],[8,2],[19,1],[31,2],[18,1],[6,2],[21,1],[33,2],[16,1],[4,2],[23,1],[35,2],[141,],[2,2]]}
    // ヨーロピアン、フレンチ 1〜36,0
    static #european() {
        return [0,0],[32,1],[15,2],[19,1],[4,2],[21,1],[2,2],[25,1],[17,2],[34,1],[6,2],[27,1],[13,2],[36,1],[11,2],[30,1],[8,2],[23,1],[10,2],[5,1],[24,2],[16,1],[33,2],[1,1],[20,2],[14,1],[31,2],[9,1],[22,2],[18,1],[29,2],[7,1],[28,2],[12,1],[35,2],[3,1],[26,2]
    }
    // マカオ(アメリカンから00を削除)
    // メキシカン(ヨーロピアンに00,000を追加)
    constructor(n,c) {this._n=n; this._c=c} // n:1〜36, c:緑0,赤1,黒2
}
class Bet {
    constructor(chip, numbers) {this._chip=chip; this._vs = []}
    result(V) {return this._chip * (this._vs.some(v=>v===V) ? : 0)}// V:ルーレットの結果値
        
    }
}
class InsideBet {
    constructor(rate, numbers) {
        this._rate = 1;
        this._numbers = [];
    }
    static straightUp(N) {return new InsideBet(36,[N])}
    static split(N) {return new InsideBet(18,N)}
}
class classRouletteA {// アメリカン・ルーレット 0,00 がある

}
window.Random = new Random();
})();

