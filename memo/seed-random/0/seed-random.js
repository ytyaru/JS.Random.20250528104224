(function(){
class Num32 {
    static u2i(N) {return (0x7FFFFFFF<N) ? N-0x100000000 : N} // uint to int
    static i2u(N) {return (0x7FFFFFFF<N) ? N-0x100000000 : N} // int to uint
}

class Xorshift32{  // 1 ~ 4294967295
    constructor(seed){
//        this.uinttoint = (num)=> (0x7FFFFFFF<num) ? num-0x100000000 : num ;
//        this.inttouint = (num)=> (num<0) ? num+0x100000000 : num ;
//        if (!Number.isSafeInteger(seed)){seed = new Date().getTime(); seed = this.inttouint(seed);}
        if (!Number.isSafeInteger(seed)){seed = new Date().getTime(); seed = Num32.i2u(seed);}
//        this.s = this.uinttoint(seed);
        this.s = Num32.u2i(seed)
    }
    next() {
        this.s ^= this.s<<13;
        this.s ^= this.s>>>17;
        this.s ^= this.s<<5;
        //return this.inttouint(this.s);
        return Num32.i2u(this.s);
    }
    get i() {return this.next()}
    get r() {return this.next() / (0xFFFFFFFF + 1)}
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
//    *Is(n) {yield this.next()}
//    *Rs(n) {yield this.next()}
    // 無限ループ
//    [Symbol.iterator]() {return {next:()=>({value: this.next(), done:false})}}
}
class Xorshift128{  // 1/0/0/0 ~ 4294967295
    constructor(x, y, z, w){
//        this.uinttoint =(num)=> (0x7FFFFFFF<num) ? num-0x100000000 : num ;
//        this.inttouint =(num)=> (num<0) ? num+0x100000000 : num ;
        /*
        if ([x,y,z,w].every(v=>Number.isSafeInteger(v)))) {
            this.x = Num32.u2i(x); this.y = Num32.u2i(y); this.z = Num32.u2i(z); this.w = Num32.u2i(w);
        } else {
            const r32 = new Xorshift32();
            const [X,Y,Z,W] = [x,y,z,w].map(v=>Num32.u2i(Number.isSafeInteger(v) ? v : r32.i));
            this.x = X; this.y = Y; this.z = Z; this.w = W;
        }
        */
        //[x,y,z,w].every(v=>Number.isSafeInteger(v))) ? [x,y,z,w] : r32.i
        //[x,y,z,w].map(v=>Number.isSafeInteger(v) ? v : r32.i))
        const r32 = new Xorshift32();
        //this.x =this.uinttoint(x), this.y =this.uinttoint(y), this.z =this.uinttoint(z), this.w =this.uinttoint(w);
        //const [X,Y,Z,W] = [x,y,z,w].map(v=>this.uinittoint(Number.isSafeInteger(v) ? v : new Date().getTime()));
        //const [X,Y,Z,W] = [x,y,z,w].map(v=>this.uinittoint(Number.isSafeInteger(v) ? v : new Date().getTime()));
        //const [X,Y,Z,W] = [x,y,z,w].map(v=>this.uinttoint(Number.isSafeInteger(v) ? v : r32.i));
        const [X,Y,Z,W] = [x,y,z,w].map(v=>Num32.u2i(Number.isSafeInteger(v) ? v : r32.i));
        this.x = X; this.y = Y; this.z = Z; this.w = W;
        /*
        */
    }
    next(){
        let t = this.x^(this.x<<11);
        this.x =this.y, this.y =this.z, this.z =this.w;
        this.w = (this.w^(this.w>>>19))^(t^(t>>>8));
        //return this.inttouint(this.w);
        return Num32.i2u(this.w);
    }
    get i() {return this.next()}
    get r() {return this.next() / (0xFFFFFFFF + 1)}
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
}
class Xoroshiro128pp{  // 1/1/1/1 ~ 4294967295
    constructor(s0, s1, s2, s3){
        const r32 = new Xorshift32();
        const [X,Y,Z,W] = [s0,s1,s2,s3].map(v=>Num32.u2i(Number.isSafeInteger(v) ? v : r32.i));
        s0 = BigInt.asUintN(32, BigInt(X)), s1 = BigInt.asUintN(32, BigInt(Y));
        s2 = BigInt.asUintN(32, BigInt(Z)), s3 = BigInt.asUintN(32, BigInt(W));
//        s0 = BigInt.asUintN(32, BigInt(s0)), s1 =BigInt.asUintN(32, BigInt(s1));
//        s2 = BigInt.asUintN(32, BigInt(s2)), s3 =BigInt.asUintN(32, BigInt(s3));
        this.s = [s1<<32n |s0, s3<<32n |s2];
    }
    rotl(big, num){
        return BigInt.asUintN(64, big<<BigInt(num))|BigInt.asUintN(num, big>>BigInt(64-num));
    }
    next(){
        let s0 =this.s[0], s1 =this.s[1];
        let result = this.rotl(s0+s1, 17)+s0;
        s1 ^= s0;
        this.s[0] = this.rotl(s0, 49)^s1^(s1<<21n);
        this.s[1] = this.rotl(s1, 28);
        return [Number(BigInt.asUintN(32, result)), Number(BigInt.asUintN(32, result>>32n))];
    }
    get i() {return this.next()}
    get I() {
        let s0 =this.s[0], s1 =this.s[1];
        let result = this.rotl(s0+s1, 17)+s0;
        s1 ^= s0;
        this.s[0] = this.rotl(s0, 49)^s1^(s1<<21n);
        this.s[1] = this.rotl(s1, 28);
        //return [Number(BigInt.asUintN(32, result)), Number(BigInt.asUintN(32, result>>32n))];
        return result;
    }
    //get r() {return this.I / 18446744073709551616n} // 2^64-1/2^64
    get r() {const v = this.next(); return v.reduce((s,V)=>s+(V / (0xFFFFFFFF + 1)),0) / v.length;} // 2^64-1/2^64
    *is(n=3) {for(let i=0; i<n; i++){yield this.i}}
    *Is(n=3) {for(let i=0; i<n; i++){yield this.I}}
    *rs(n=3) {for(let i=0; i<n; i++){yield this.r}}
    jump(long=false){
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
// https://magicant.github.io/sjavascript/mt.html
// mt.js 0.2.4 (2005-12-23)
/*
Mersenne Twister in JavaScript based on "mt19937ar.c"
 * JavaScript version by Magicant: Copyright (C) 2005 Magicant
 * Original C version by Makoto Matsumoto and Takuji Nishimura
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/mt.html
Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
All rights reserved.
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

  1. Redistributions of source code must retain the above copyright
     notice, this list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright
     notice, this list of conditions and the following disclaimer in the
     documentation and/or other materials provided with the distribution.

  3. The names of its contributors may not be used to endorse or promote 
     products derived from this software without specific prior written 
     permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
// Methods whose name starts with "_" are private methods.
// Don't call them externally!
/**
 * Constructor: MersenneTwister([integer/Array<integer> seed])
 * initializes the object with the given seed.
 * The seed may be an integer or an array of integers.
 * If the seed is not given, the object will be initialized with the current
 * time: new Date().getTime().
 * See also: setSeed(seed).
 */
function MersenneTwister(seed) {
	if (arguments.length == 0)
		seed = new Date().getTime();
	
	this._mt = new Array(624);
	this.setSeed(seed);
}

/** multiplies two uint32 values and returns a uint32 result. */
MersenneTwister._mulUint32 = function(a, b) {
	var a1 = a >>> 16, a2 = a & 0xffff;
	var b1 = b >>> 16, b2 = b & 0xffff;
	return (((a1 * b2 + a2 * b1) << 16) + a2 * b2) >>> 0;
};

/** returns ceil(value) if value is finite number, otherwise 0. */
MersenneTwister._toNumber = function(x) {
	return (typeof x == "number" && !isNaN(x)) ? Math.ceil(x) : 0;
};

/**
 * Method: setSeed(integer/Array<integer> seed)
 * resets the seed. The seed may be an integer or an array of integers.
 * Elements in the seed array that are not numbers will be treated as 0.
 * Numbers that are not integers will be rounded down.
 * The integer(s) should be greater than or equal to 0 and less than 2^32.
 * This method is compatible with init_genrand and init_by_array function of
 * the original C version.
 */
MersenneTwister.prototype.setSeed = function(seed) {
	var mt = this._mt;
	if (typeof seed == "number") {
		mt[0] = seed >>> 0;
		for (var i = 1; i < mt.length; i++) {
			var x = mt[i-1] ^ (mt[i-1] >>> 30);
			mt[i] = MersenneTwister._mulUint32(1812433253, x) + i;
		}
		this._index = mt.length;
	} else if (seed instanceof Array) {
		var i = 1, j = 0;
		this.setSeed(19650218);
		for (var k = Math.max(mt.length, seed.length); k > 0; k--) {
			var x = mt[i-1] ^ (mt[i-1] >>> 30);
			x = MersenneTwister._mulUint32(x, 1664525);
			mt[i] = (mt[i] ^ x) + (seed[j] >>> 0) + j;
			if (++i >= mt.length) {
				mt[0] = mt[mt.length-1];
				i = 1;
			}
			if (++j >= seed.length) {
				j = 0;
			}
		}
		for (var k = mt.length - 1; k > 0; k--) {
			var x = mt[i-1] ^ (mt[i-1] >>> 30);
			x = MersenneTwister._mulUint32(x, 1566083941);
			mt[i] = (mt[i] ^ x) - i;
			if (++i >= mt.length) {
				mt[0] = mt[mt.length-1];
				i = 1;
			}
		}
		mt[0] = 0x80000000;
	} else {
		throw new TypeError("MersenneTwister: illegal seed.");
	}
};

/** returns the next random Uint32 value. */
MersenneTwister.prototype._nextInt = function() {
	var mt = this._mt, value;
	
	if (this._index >= mt.length) {
		var k = 0, N = mt.length, M = 397;
		do {
			value = (mt[k] & 0x80000000) | (mt[k+1] & 0x7fffffff);
			mt[k] = mt[k+M] ^ (value >>> 1) ^ ((value & 1) ? 0x9908b0df : 0);
		} while (++k < N-M);
		do {
			value = (mt[k] & 0x80000000) | (mt[k+1] & 0x7fffffff);
			mt[k] = mt[k+M-N] ^ (value >>> 1) ^ ((value & 1) ? 0x9908b0df : 0);
		} while (++k < N-1);
		value = (mt[N-1] & 0x80000000) | (mt[0] & 0x7fffffff);
		mt[N-1] = mt[M-1] ^ (value >>> 1) ^ ((value & 1) ? 0x9908b0df : 0);
		this._index = 0;
	}
	
	value = mt[this._index++];
	value ^=  value >>> 11;
	value ^= (value <<   7) & 0x9d2c5680;
	value ^= (value <<  15) & 0xefc60000;
	value ^=  value >>> 18;
	return value >>> 0;
};

/**
 * Method: nextInt([[number min,] number max])
 * returns a random integer that is greater than or equal to min and less than
 * max. The value of (max - min) must be positive number less or equal to 2^32.
 * If min is not given or not a number, this method uses 0 for min.
 * If neither of min and max is given or max is out of range, this method
 * uses 2^32 for max.
 * This method is compatible with genrand_int32 function of the original C
 * version for min=0 & max=2^32, but not with genrand_int31 function.
 */
MersenneTwister.prototype.nextInt = function() {
	var min, sup;
	switch (arguments.length) {
	case 0:
		return this._nextInt();
	case 1:
		min = 0;
		sup = MersenneTwister._toNumber(arguments[0]);
		break;
	default:
		min = MersenneTwister._toNumber(arguments[0]);
		sup = MersenneTwister._toNumber(arguments[1]) - min;
		break;
	}
	
	if (!(0 < sup && sup < 0x100000000))
		return this._nextInt() + min;
	if ((sup & (~sup + 1)) == sup)
		return ((sup - 1) & this._nextInt()) + min;
	
	var value;
	do {
		value = this._nextInt();
	} while (sup > 4294967296 - (value - (value %= sup)));
	return value + min;
};

/**
 * Method: next()
 * returns a random number that is greater than or equal to 0 and less than 1.
 * This method is compatible with genrand_res53 function of the original C
 * version.
 */
MersenneTwister.prototype.next = function() {
	var a = this._nextInt() >>> 5, b = this._nextInt() >>> 6;
	return (a * 0x4000000 + b) / 0x20000000000000; 
};
window.SeedRandom = {
    MersenneTwister: MersenneTwister,
    Xorshift32: Xorshift32,
    Xorshift128: Xorshift128,
    Xoroshiro128pp: Xoroshiro128pp,
}

})();
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
/*
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
*/
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


