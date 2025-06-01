/*
class Random {
  constructor(seed = 88675123) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = seed;
  }
  
  // XorShift
  next() {
    let t;
 
    t = this.x ^ (this.x << 11);
    this.x = this.y; this.y = this.z; this.z = this.w;
    return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 
  }
  
  // min以上max以下の乱数を生成する
  nextInt(min, max) {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }
}
*/
class SeedRandom {
    constructor(seed) {
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.w = seed;
    }
    get v() {
        let t = this.x ^ (this.x << 11);
        this.x = this.y; this.y = this.z; this.z = this.w;
        return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 

    }
    *g(...A) {
             if (0===A.length) {yield this.v}
        else if (1===A.length && Number.isSafeInteger(A[0]) && 0<A[0]) {for (let i of [...new Array(A[0])]) {yield this.v}}
        else if (2===A.length && [0,1].map(i=>Number.isSafeInteger(A[i])) && A[0]<A[1]) {
            const L = A[1] - A[0] + 1;
            for (let i of [...new Array(L)]) {yield (this.v*L)+A[0]}
        }
        throw new TypeError(`引数は0〜2個のみ有効です。1個なら自然数、2個なら(小,大)の正数。`)
    }
}
/*
 * 疑似乱数（シード値による再現性あり）
 * Xorshift32   最も単純で高速だが偏りがある。
 * Xorshift128  上記のバイト数を増やした。
 * Xoroshiro128++
 */

/*
class Xorshift32{  // 1 ~ 4294967295
    constructor(seed){
        const self = this;
        self.uinttoint =(num)=> (0x7FFFFFFF<num) ? num-0x100000000 : num ;
        self.inttouint =(num)=> (num<0) ? num+0x100000000 : num ;
        self.s = self.uinttoint(seed);
    }
    next() {
        const self = this;
        self.s ^= self.s<<13;
        self.s ^= self.s>>>17;
        self.s ^= self.s<<5;
        return self.inttouint(self.s);
    }
    *g() {yield this.next()}
}
class Xorshift128{  // 1/0/0/0 ~ 4294967295
    constructor(x, y, z, w){
        const self = this;
        self.uinttoint =(num)=> (0x7FFFFFFF<num) ? num-0x100000000 : num ;
        self.inttouint =(num)=> (num<0) ? num+0x100000000 : num ;
        self.x =self.uinttoint(x), self.y =self.uinttoint(y), self.z =self.uinttoint(z), self.w =self.uinttoint(w);
    }
    next(){
        const self = this;
        let t = self.x^(self.x<<11);
        self.x =self.y, self.y =self.z, self.z =self.w;
        self.w = (self.w^(self.w>>>19))^(t^(t>>>8));
        return self.inttouint(self.w);
    }
}
*/

class Xorshift32{  // 1 ~ 4294967295
    constructor(seed){
        this.uinttoint = (num)=> (0x7FFFFFFF<num) ? num-0x100000000 : num ;
        this.inttouint = (num)=> (num<0) ? num+0x100000000 : num ;
        this.s = this.uinttoint(seed);
    }
    next() {
        this.s ^= this.s<<13;
        this.s ^= this.s>>>17;
        this.s ^= this.s<<5;
        return this.inttouint(this.s);
    }
    *g() {yield this.next()}
}
class Xorshift128{  // 1/0/0/0 ~ 4294967295
    constructor(x, y, z, w){
        this.uinttoint =(num)=> (0x7FFFFFFF<num) ? num-0x100000000 : num ;
        this.inttouint =(num)=> (num<0) ? num+0x100000000 : num ;
        this.x =this.uinttoint(x), this.y =this.uinttoint(y), this.z =this.uinttoint(z), this.w =this.uinttoint(w);
    }
    next(){
        const this = this;
        let t = this.x^(this.x<<11);
        this.x =this.y, this.y =this.z, this.z =this.w;
        this.w = (this.w^(this.w>>>19))^(t^(t>>>8));
        return this.inttouint(this.w);
    }
}
class Xoroshiro128pp{  // 1/1/1/1 ~ 4294967295
    constructor(s0, s1, s2, s3){
        const this = this;
        s0 =BigInt.asUintN(32, BigInt(s0)), s1 =BigInt.asUintN(32, BigInt(s1));
        s2 =BigInt.asUintN(32, BigInt(s2)), s3 =BigInt.asUintN(32, BigInt(s3));
        this.s = [s1<<32n |s0, s3<<32n |s2];
    }
    rotl(big, num){
        return BigInt.asUintN(64, big<<BigInt(num))|BigInt.asUintN(num, big>>BigInt(64-num));
    }
    next(){
        const this = this;
        let s0 =this.s[0], s1 =this.s[1];
        let result = this.rotl(s0+s1, 17)+s0;
        s1 ^= s0;
        this.s[0] = this.rotl(s0, 49)^s1^(s1<<21n);
        this.s[1] = this.rotl(s1, 28);
        return [Number(BigInt.asUintN(32, result)), Number(BigInt.asUintN(32, result>>32n))];
    }
    jump(long=false){
        const this = this;
        const JUMP = long ? [0x360FD5F2CF8D5D99n,0x9C6E6877736C46E3n] : [0x2BD7A6A6E99C2DDCn,0x0992CCAF6A6FCA05n] ;
        let s0 =0n, s1 =0n;
        for(let i=0; i<JUMP.length; i++){
            for(let b=0; b<64; b++){
                if(JUMP[i]&0b1n<<BigInt(b))
                s0 ^=this.s[0], s1 ^=this.s[1];
                this.next()
            }
        }
        this.s[0] =s0, this.s[1] =s1;
    }
}
