// https://magicant.github.io/sjavascript/mt.html
class MersenneTwister {// メルセンヌ・ツイスタ 高品質な疑似乱数。一様分布乱数。0〜2^32-1。0以上1未満。
    constructor(seed) {
        if (arguments.length == 0) {seed = new Date().getTime();}
        this._mt = new Array(624);
        this.setSeed(seed);
    }
    static _mulUint32(a, b){// multiplies two uint32 values and returns a uint32 result.
        var a1 = a >>> 16, a2 = a & 0xffff;
        var b1 = b >>> 16, b2 = b & 0xffff;
        return (((a1 * b2 + a2 * b1) << 16) + a2 * b2) >>> 0;
    }
    // returns ceil(value) if value is finite number, otherwise 0.
    static _toNumber(x) {return (typeof x == "number" && !isNaN(x)) ? Math.ceil(x) : 0;}
    /**
     * Method: setSeed(integer/Array<integer> seed)
     * resets the seed. The seed may be an integer or an array of integers.
     * Elements in the seed array that are not numbers will be treated as 0.
     * Numbers that are not integers will be rounded down.
     * The integer(s) should be greater than or equal to 0 and less than 2^32.
     * This method is compatible with init_genrand and init_by_array function of
     * the original C version.
     */
    setSeed(seed) {
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
                if (++j >= seed.length) {j = 0;}
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
        } else {throw new TypeError("MersenneTwister: illegal seed.");}
    }
    // returns the next random Uint32 value.
    _nextInt() {
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
    nextInt() {
        var min, sup;
        switch (arguments.length) {
        case 0: return this._nextInt();
        case 1:
            min = 0;
            sup = MersenneTwister._toNumber(arguments[0]);
            break;
        default:
            min = MersenneTwister._toNumber(arguments[0]);
            sup = MersenneTwister._toNumber(arguments[1]) - min;
            break;
        }
        if (!(0 < sup && sup < 0x100000000)){return this._nextInt() + min;}
        if ((sup & (~sup + 1)) == sup){return ((sup - 1) & this._nextInt()) + min;}
        var value;
        do {value = this._nextInt();}
        while (sup > 4294967296 - (value - (value %= sup)));
        return value + min;
    };
    /**
     * Method: next()
     * returns a random number that is greater than or equal to 0 and less than 1.
     * This method is compatible with genrand_res53 function of the original C
     * version.
     */
    next() {
        var a = this._nextInt() >>> 5, b = this._nextInt() >>> 6;
        return (a * 0x4000000 + b) / 0x20000000000000; 
    };
    get r() {return this.next()} // 0〜1(0以上1未満)
    get i() {return this.nextInt()} // 0〜2^32-1
    get MIN() {return 0}
    get MAX() {return 4294967295} // 2**32-1
    fromLength(l,s=0) {
        const S = s;
        const E = MersenneTwister._toNumber(arguments[0]);

    }
}

