(function(){
// new IntSpan(5,9)  5..7..9     
// new IntSpan(0,99) 0..49..99   
// new IntSpan(100)  0..49..99   0を始点
// new IntSpan(-100) -50..0..49  0を中点
// new IntSpan(-101) -50..0..50  
class IntSpan {
    static fromLength(length) {
        if (Number.isSafeInteger(length)) {
            if (1<length) {return new IntSpan(0, length-1)}
            else if (length<-1){
                const H = Math.floor(length/2);
                if (0===Math.abs(length%2)) {return new IntSpan(H, (H*-1)-1)}// ゼロは正数として扱えば負数と同数になる
                else {return new IntSpan(H, (H*-1))} // ゼロは正負どちら側でもない値として扱えば負数と同数になる
            }
        }
        throw new TypeError(`引数はNumber.isSafeInteger()で2以上か-2以下の整数であるべきです。正数なら0〜引数-1迄、負数で奇数なら0を中点とし0を除外した各数を正数と負数が同数になるような範囲にします。負数で偶数なら0を正数として扱い半数にします。`)
    }
    static fromSpan(min, max) {return new IntSpan(min, max)}
    static of(...args) {
             if (0===args.length) {return new IntSpan(1, 6)}
        else if (1===args.length) {return this.fromLength(...args)}
        else if (2===args.length) {return this.fromSpan(...args)}
        else {throw new TypeError(`引数は(length)/(min,max)の2パターンのみ有効です。`)}
    }
    constructor(min, max) {this.v = [min,max];}
    get m() {return this._m}// 最小値
    get M() {return this._M}// 最大値
    set m(v) {if(this.isValid(v)){this._m=v}}
    set M(v) {if(this.isValid(v)){this._M=v}}
    get v() {return [this._m, this._M]}// [最小値,最大値]
    set v(V) {
        if (Array.isArray(V) && 2===V.length && V.every(v=>this.isValid(v)) && V[0]<V[1]) {this.m=V[0]; this.M=V[1];}
        else {throw new TypeError(`vの値は[min,max]のようなNumber.isSafeInteger()な数を二個持つ配列であるべきです。各数の差は1以上あり昇順であるべきです。`)}
    }
    get l() {return Math.abs(this.m - this.M)+1}// 長さ length,size,width
    toIndex(v) {// v=min〜maxの範囲内の値を渡された時の0〜length-1整数値を返す
        if (this.isValid(v) && this.m<=i && i<=this.M) {return v + Math.abs(this.m)}
        else{throw new TypeError(`vは${this.m}〜${this.M}迄の整数であるべきです。`)}
    }
    fromIndex(i) { // i=0〜length-1の範囲内の値を渡された時のmin〜max整数値を返す
        if (this.isValid(i)) {return (0<=i ? this.m : this.M) + (i % this.l)}
        else{throw new TypeError(`iは0〜${this.l-1}迄の整数または負数であるべきです。`)}
    }
    fromRate(r) {// 0〜1の値を渡された時のmin〜max整数値を返す
        if ('number'!==typeof r || r<0 || 1<r) {throw new TypeError(`引数は0〜1迄の少数であるべきです。`)}
        return this.l * r;
    }
    toRate(v) {// min〜maxを渡された時の0〜1を返す
        if ('number'!==typeof v || v<this.m || this.M<v) {throw new TypeError(`引数は${this.m}〜${this.M}迄のNumber型整数であるべきです。`)}
        return v / this.l;
    }
    isValid(v) {if(Number.isSafeInteger(v)){return true}else{throw new TypeError(`Number.isSafeInteger(v)であるべきです。`)}}
}
// new Range(0,99) 0..49..99
// new Range(100)  0..49..99
// new Range(-100) -50..0..49
// new Range(-101) -50..0..50
class Range {// 整数範囲。値間の差は必ず1で連続する。
    static fromLength(length) {
        if (Number.isSafeInteger(length)) {
            if (1<length) {return new Range(0, length-1)}
            else if (length<-1){
                const H = Math.floor(length/2);
                if (0===Math.abs(length%2)) {return new Range(H, (H*-1)-1)}
                else {return new Range(H, (H*-1), 0)} // 奇数の場合、真偽判定時にどちらか一方に偏る
            }
        }
        throw new TypeError(`引数はNumber.isSafeInteger()で2以上か-2以下の整数であるべきです。正数なら0〜引数-1迄、負数で奇数なら0を中点とし0を除外した各数を正数と負数が同数になるような範囲にします。負数で偶数なら0を正数として扱い半数にします。`)
    }
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
/*
thretholds = [{r:0.5, v:4, s:['失敗','成功']},{r:0.1, v:0, s:'致命的失敗'},{r:0.9, v:9, s:'決定的成功'}];
    0.1: '致命的失敗',
    ...
    0.4: '失敗'
    0.5: '成功'
    ...
    0.9: '決定的成功'

2 boolean(false/true)
3 int(-1,0,+1)         // 0の解釈: 引き分け(再度挑戦) / 無効(挑戦自体が無かった事になる。挑戦したのに成功も失敗もしなかった事に)
4 int(-2,-1,+1,+2)     // ±2の解釈: 成否の強化版
5 int(-2,-1,0,+1,+2)
*/

})();
