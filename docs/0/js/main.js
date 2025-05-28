window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const author = 'ytyaru';
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/JS.Random.20250528104224/`}, 'Random')),
        van.tags.p('ランダムな値や配列を生成する。'),
//        van.tags.p('Generate random values and arrays.'),
    );
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make());

    const a = new Assertion();
//    a.t(true);
//    a.f(false);
//    a.e(TypeError, `msg`, ()=>{throw new TypeError(`msg`)});
    a.t(Type.isIns(Random))
    a.t('seq' in Array)
    a.t('shuffle' in Array.prototype)
    a.t('toShuffled' in Array.prototype)
    a.t('function'===typeof Array.seq)
    a.t('function'===typeof Array.prototype.shuffle)
    a.t('function'===typeof Array.prototype.toShuffled)
    // Array.seq()
    for (let v of [undefined, null, NaN, Infinity, -Infinity, 0, -1, 0.1, '1']) {
        a.e(TypeError, `Sequence.make()の引数は自然数一つか正整数二つか配列のみ有効です。自然数は0〜N-1、正整数二つはN〜Mの整数を、配列ならそれ自体を返します。`, ()=>Array.seq(v))
    }
    a.t(()=>{
        const V = 5
        const A = Array.seq(V);
        console.log(A)
        return V===A.length && 0===A[0] && 1===A[1] && 2===A[2] && 3===A[3] && 4===A[4];
    })
    a.t(()=>{
        const V = 5
        const A = Array.seq(V).fill(0);
        console.log(A)
        return V===A.length && A.every(v=>v===0);
    })
    a.t(()=>{// shuffle(), toShuffled()
        const A = Array.seq(5);
        const B = A.shuffle();    //   破壊的メソッド
        const C = A.toShuffled(); // 非破壊的メソッド
        console.log(`A:${A}`)
        console.log(`B:${B}`)
        console.log(`C:${C}`)
        return A===B && A!==C;
    })
    // 内部クラスは未定義である
    a.e(ReferenceError, ``, ()=>Is)
    a.e(ReferenceError, ``, ()=>RndReal)
    a.e(ReferenceError, ``, ()=>RndBool)
    a.e(ReferenceError, ``, ()=>RndInt)
    a.e(ReferenceError, ``, ()=>Sequence)
    a.e(ReferenceError, ``, ()=>Deck)
    a.e(ReferenceError, ``, ()=>Lottery)
    a.t(()=>{
        const R = Random.R;
        return 'number'===typeof R && 0<=R && R<=1;
    })
    a.t(()=>{
        const B = Random.B();// 0.5 50%
        return 'boolean'===typeof B;
    })
    a.t(()=>{
        const B = Random.B(undefined);// 0.5 50%
        return 'boolean'===typeof B;
    })
    a.t(()=>{
        const B = Random.B(0.5);
        return 'boolean'===typeof B;
    })
    a.t(()=>{
        const B = Random.B(0.25);
        return 'boolean'===typeof B;
    })
    a.t(()=>{
        const B = Random.B(0);
        return 'boolean'===typeof B && false===B;
    })
    a.t(()=>{
        const B = Random.B(Number()); // 0
        return 'boolean'===typeof B && false===B;
    })
    a.t(()=>{
        const B = Random.B(1);
        return 'boolean'===typeof B && true===B;
    })
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(2))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(-1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0,0))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(1,0))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0,1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(1,0.1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0.1,1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0.1,0.1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(null))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(NaN))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(Infinity))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(-Infinity))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(''))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B('0.5'))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0n))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(1n))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(true))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(false))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(new Number()))
    a.t(()=>{
        const B = Random.B(1,1);
        return 'boolean'===typeof B && true===B;
    })
    a.t(()=>{
        const B = Random.B(2,1);
        return 'boolean'===typeof B && true===B;
    })
    a.t(()=>{
        const B = Random.B(1,2);
        return 'boolean'===typeof B;
    })
    a.e(TypeError, `Random.I()の引数は自然数一つか正整数二つか配列のみ有効です。自然数は0〜V-1、正整数二つはV〜Mの整数を、同率で返します。配列なら要素値は0以上の整数のみ有効であり、その重みから出現率を算出して0〜要素数-1の整数を一つ返します。`, ()=>Random.I())
    a.e(TypeError, `Random.I()の引数は自然数一つか正整数二つか配列のみ有効です。自然数は0〜V-1、正整数二つはV〜Mの整数を、同率で返します。配列なら要素値は0以上の整数のみ有効であり、その重みから出現率を算出して0〜要素数-1の整数を一つ返します。`, ()=>Random.I(0))
    a.e(TypeError, `Random.I()の引数は自然数一つか正整数二つか配列のみ有効です。自然数は0〜V-1、正整数二つはV〜Mの整数を、同率で返します。配列なら要素値は0以上の整数のみ有効であり、その重みから出現率を算出して0〜要素数-1の整数を一つ返します。`, ()=>Random.I(-1))
    a.t(()=>{
        const V = 3;
        const I = Random.I(V);
        return Number.isInteger(I) && 0<=I && I<=V-1;
    })
    a.t(()=>{
        const V = 1;
        const M = 6;
        const I = Random.I(V,M);
        return Number.isInteger(I) && V<=I && I<=M;
    })
    a.t(()=>{
        const V = [3,2,1]; // 0:50%,1:33%,2:17%
        const I = Random.I(V);
        return Number.isInteger(I) && 0<=I && I<=V.length-1;
    })
    a.t(()=>{
        const V = [0,0,1]; // 0:0%,1:0%,2:100%
        const I = Random.I(V);
        return Number.isInteger(I) && 2===I;
    })
    a.t(()=>{
        const V = Array.seq(3); // [0,1,2] 0:0%,1:33%,2:67%
        const I = Random.I(V);
        return Number.isInteger(I) && 0<=I && I<=V.length-1;
    })
    a.t(()=>{
        const V = Array.seq(3).fill(1); // [1,1,1] 0:33%,1:33%,2:33%
        const I = Random.I(V);
        return Number.isInteger(I) && 0<=I && I<=V.length-1;
    })
    for (let v of [[],[0],[0,0],[0,0,0]]) {
        console.log(`v:${v}`)
        a.e(TypeError, `引数の合計は1以上になるべきです。`, ()=>Random.I(v))
    }
    for (let v of [undefined, null, NaN, Infinity, -Infinity, ['a'], [0.1], [0.1, 1], [-1], [-1,2], [undefined], [null], [NaN], [Infinity], [-Infinity]]) {
        console.log(`v:${v}`)
        a.e(TypeError, `Random.I()の引数は自然数一つか正整数二つか配列のみ有効です。自然数は0〜V-1、正整数二つはV〜Mの整数を、同率で返します。配列なら要素値は0以上の整数のみ有効であり、その重みから出現率を算出して0〜要素数-1の整数を一つ返します。`, ()=>Random.I(v))
    }
    a.fin();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

