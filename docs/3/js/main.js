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
        a.e(TypeError, `Sequence.make()の引数は自然数一つか正数二つか配列のみ有効です。自然数は0〜N-1、正整数二つはN〜Mの整数を、配列ならそれ自体を返します。正数二つなら昇順でその差は1以上あるべきです。`, ()=>Array.seq(v))
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
        console.log(B)
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
        const B = Random.B(-0);
        return 'boolean'===typeof B && false===B;
    })
    a.t(()=>{
        const B = Random.B(+0);
        return 'boolean'===typeof B && false===B;
    })
    a.t(()=>{// 引数が負数なら100%偽を返す。たとえば命中率−回避率という計算式で100%-20%=80%=0.8や、50%-70%=-20%=-0.2など。
        const B = Random.B(-1);
        return 'boolean'===typeof B && false===B;
    })
    a.t(()=>{
        const B = Random.B(-0.5);
        return 'boolean'===typeof B && false===B;
    })
    a.t(()=>{
        const B = Random.B(-Infinity);
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
    a.t(()=>{// 引数が1以上なら100%真を返す
        const B = Random.B(1.2);
        return 'boolean'===typeof B && true===B;
    })
    a.t(()=>{// 引数が1以上なら100%真を返す
        const B = Random.B(2);
        return 'boolean'===typeof B && true===B;
    })
    a.t(()=>{// 引数が1以上なら100%真を返す
        const B = Random.B(Infinity);
        return 'boolean'===typeof B && true===B;
    })
//    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(2))
//    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(-1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0,0))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(1,0))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0,1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(1,0.1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0.1,1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(0.1,0.1))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(null))
    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(NaN))
//    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(Infinity))
//    a.e(TypeError, `Random.B()の引数は0〜1の実数か自然数二つ(分子,分母)のみ有効です。`, ()=>Random.B(-Infinity))
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
    a.t(()=>{
        const S = [].choice();
        return undefined===S;
    });
    a.t(()=>{
        const S = ['失敗'].choice();
        return '失敗'===S;
    });
    a.t(()=>{
        const S = ['失敗','成功'].choice();
        return ['失敗','成功'].some(v=>v===S);
    });
    a.t(()=>'失敗'===['失敗','成功'].choice([1,0]));
    a.t(()=>'成功'===['失敗','成功'].choice([0,1]));
    a.e(TypeError, `引数の合計は1以上になるべきです。`, ()=>['失敗','成功'].choice([0,0]));
    a.e(TypeError, `要素数と重み数が異なります。同数用意してください。`, ()=>['失敗','成功'].choice([1]));
    a.t(()=>{
        const C = [...'⚀⚁⚂⚃⚄⚅'];
        const V = C.choice();
        return C.some(c=>c===V);
    })

    a.t(()=>{
        const C = ['失敗','成功'];
        const S = Random.S(Random.B(0), C);
        return '失敗'===S;
    })
    a.t(()=>{
        const C = ['失敗','成功'];
        const S = Random.S(Random.B(1), C);
        return '成功'===S;
    })
    a.t(()=>{
        const C = ['失敗','成功'];
        const S = Random.S(Random.B(), C);
        return C.some(c=>c===S);
    })
    a.t(()=>{
        const C = ['⚀','⚁','⚂','⚃','⚄','⚅'];
        const V = Random.I(6);
        const S = Random.S(V, C);
        return 0<=V && V<=5 && C.some(c=>c===S);
    })
    a.t(()=>{// トランプ52枚を同率で一枚引く
        // 🂠1F0A0,spade🂡1F0A1,hart:🂱1F0B1,diamond:1F0C1🃁,club:1F0D1🃑
        // Joker:1F0BF🂿, black:1F0CF🃏, white:1F0DF🃟
//        const Vs = Array.sec(13*4); // 52
        const Ns = Array.seq(13);   // A,2,3,4,5,6,7,8,9,10,J,Q,K
        const Ss = Array.seq(4);    // ♠♥♦♣
        const Js = Array.seq(2);    // BlackJoker/WhiteJoker
        const Cs = Array.product(Ss,Ns); // [♠,A],[♠,2],....,[♣,K]
        const getCard = (s,n)=>String.fromCodePoint(0x1F0A1 + (16 * s) + (11<=n ? n+1 : n));
        const getName = (s,n)=>{
            const Ss = [...'♠♥♦♣'];
            const Ns = 'A,2,3,4,5,6,7,8,9,10,J,Q,K'.split(',');
            return `${Ss[s]}${Ns[n]}`;
        }
        const V = Random.I(13*4); // 0〜51
        const card = getCard(...Cs[V]);
        const name = getName(...Cs[V]);
        console.log(V,Cs[V],card,name)
        return 0<=V && V<=51;
    })
    // 0〜9,A〜Z,a〜z,ルーレット,トランプ,麻雀牌,ア〜ン,12星座(♈♉♊♋♌♍♎♏♐♑♒♓),6チェス(♔♕♖♗♘♙)

    // Random.A()
    a.t(()=>{
        const N = 5;
        const A = Random.A(N);
        return N===A.length && A.every(v=>0<=v && v<=N-1);
    })
    a.t(()=>{
        const S = 3;
        const E = 5;
        const A = Random.A(S,E);
        console.log(A, E-S+1===A.length , A.every(v=>S<=v && v<=E))
        return E-S+1===A.length && A.every(v=>S<=v && v<=E);
    })
    a.t(()=>{
        const S = 3;
        const E = 5;
        const L = Array.seq(S,E);
        const A = Random.A(L); // Lを複製せずシャッフルする
        return E-S+1===A.length && A.every(v=>S<=v && v<=E) && A===L;
    })
    a.t(()=>{
        const S = 3;
        const E = 5;
        const L = Array.seq(S,E);
        const A = Random.A(L,false); // Lを複製せずシャッフルする
        return E-S+1===A.length && A.every(v=>S<=v && v<=E) && A===L;
    })
    a.t(()=>{
        const S = 3;
        const E = 5;
        const L = Array.seq(S,E);
        const A = Random.A(L,true); // Lを複製した別の配列をシャッフルして返す
        console.log(A)
        return E-S+1===A.length && A.every(v=>S<=v && v<=E) && A!==L;
        //return E-S+1===A.length && A.every(v=>S<=v && v<=E) && 3===A[0] && 4===A[1] && 5===A[2];
    })
    for (let p of [undefined,null,NaN,0,-1,0.1,'1']) {
        a.e(TypeError, `Random.A()の引数は(自然数)か(正数,正数)か(配列,真偽値)のみ有効です。配列なら要素値は正数(0以上の整数)のみ有効です。正数二つなら昇順でその差は1以上あるべきです。`, ()=>Random.A(p))
    }
    for (let ps of [[-1,-1],[0,0],[-1,0],[0,-1],[3,3],[5,1]]) {
        a.e(TypeError, `Random.A()の引数は(自然数)か(正数,正数)か(配列,真偽値)のみ有効です。配列なら要素値は正数(0以上の整数)のみ有効です。正数二つなら昇順でその差は1以上あるべきです。`, ()=>Random.A(...ps))
    }

    // Random.Bs()
    a.e(TypeError, `引数の個数は1か2か3のみ有効です。最後の引数は繰り返し回数で自然数のみ有効です。`, ()=>Random.Bs());
    a.t(()=>{
        const N = 3;
        const Bs = Random.Bs(N);
        return N===Bs.length && Bs.every(b=>'boolean'===typeof b);
    })
    a.t(()=>{
        const N = 3;
        const Bs = Random.Bs(0.5, N);
        return N===Bs.length && Bs.every(b=>'boolean'===typeof b);
    })
    a.t(()=>{
        const N = 3;
        const Bs = Random.Bs(1, 2, N);
        return N===Bs.length && Bs.every(b=>'boolean'===typeof b);
    })
    // Random.Is()
    a.e(TypeError, `引数の個数は2か3のみ有効です。最後の引数は繰り返し回数で自然数のみ有効です。`, ()=>Random.Is());
    a.e(TypeError, `引数の個数は2か3のみ有効です。最後の引数は繰り返し回数で自然数のみ有効です。`, ()=>Random.Is(6));
    a.t(()=>{
        const N = 3;
        const Is = Random.Is(6,N);
        return N===Is.length && Is.every(v=>0<=v && v<=5);
    })
    a.t(()=>{
        const N = 3;
        const Is = Random.Is(1,6,N);
        return N===Is.length && Is.every(v=>1<=v && v<=6);
    })
    // Random.As()
    a.e(TypeError, `引数の個数は2か3のみ有効です。最後の引数は繰り返し回数で自然数のみ有効です。`, ()=>Random.As());
    a.e(TypeError, `引数の個数は2か3のみ有効です。最後の引数は繰り返し回数で自然数のみ有効です。`, ()=>Random.As(6));
    a.t(()=>{
        const N = 3;
        const As = Random.As(6,N);
        return N===As.length && As.every(v=>Array.isArray(v) && v.every(V=>0<=V && V<=5));
    })
    a.t(()=>{
        const N = 3;
        const As = Random.As(1,6,N);
        console.log(As)
        //return N===As.length && As.every(v=>1<=v && v<=6);
        return N===As.length && As.every(v=>Array.isArray(v) && v.every(V=>1<=V && V<=6));
    })
    a.t(()=>{
        const N = 3;
        const As = Random.As(Array.seq(1,6),false,N);
        //return N===As.length && As.every(v=>1<=v && v<=6);
        return N===As.length && As.every(v=>Array.isArray(v) && v.every(V=>1<=V && V<=6));
    })
    // Random.Ss()
    a.t(()=>{
        const Ss = Random.Ss([false, true, false], ['失敗', '成功']);
        return 3===Ss.length && '失敗'===Ss[0] && '成功'===Ss[1] && '失敗'===Ss[2];
    })
    // Random.Ss() + Bs()
    a.t(()=>{// Bs,Ss
        const N = 3;
        const Bs = Random.Bs(0.5, N);
        const Ss = Random.Ss(Bs, ['失敗','成功'], N);
        console.log(Bs)
        console.log(Ss)
        return 3===Ss.length && Ss.every(s=>['失敗','成功'].some(v=>v===s));
    })
    a.t(()=>{
        const N = 3;
        const Bs = Random.Bs(1, 2, N);
        const Ss = Random.Ss(Bs, ['失敗','成功'], N);
        console.log(Bs)
        console.log(Ss)
        return 3===Ss.length && Ss.every(s=>['失敗','成功'].some(v=>v===s));
    })
    a.fin();
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});

