// 数列
/*
class Seq {constructor(l,s,e) {this._l=l; this._s=s; this._e=e;}}
class SeqLen {constructor(l,s) {super(l,s,l+s-1)}}
class SeqRng {constructor(s,e) {super(s,e,e-s+1)}}
*/
class Seq {
    constructor(l,s,e,S=1) {
        this._l=l; this._s=s; this._e=e; this._S=S; this._a=[...new Array(this._l)].map((_,i)=>this._s+(this._S*i)); this._i=0;
    }
    get a() {return [...new Array(this._l)].map((_,i)=>this._a[i])} // this._aの複製を返す
    get v() {return }
    get g() {return this.gen()}
    *gen() {
        while(true) {
            yield this._a[this._i]
            if (this._l<=this._i) {this._i=0}
        }
    }
    sort(isDesc=false) {return this._a.sort(isDesc ? (a,b)=>b-a : (a,b)=>a-b)}
    shuffle(isCopy=false) {
        const R = isCopy ? [...new Array(this._a.length)].map((_,i)=>this._a[i]) : this._a; // 配列コピー
        for (let i=R.length-1; i>0; i--) {
            let j = Math.floor(RndReal.V() * (i + 1)); // 0 から i のランダムなインデックス
            [R[i], R[j]] = [R[j], R[i]]; // 要素を入れ替えます
        }
        return R;
    }
    clear() {this._i = 0;}
}

/*
連番
  0〜L-1
  S〜E
歯抜け
  step
関数
  fn
*/
/*
取得する大本の集合は？
* 無限個数である（無限に重複しうる）
* 有限個数である
*/
/*
if (new.target) {// new演算子を使って呼び出された場合

} else {// new演算子を使わず呼び出された場合

}
*/


