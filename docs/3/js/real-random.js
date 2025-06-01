class RealRandom {
    constructor() {
        this._S = {
            seed: 1234,
            x: 123456789,
            y: 362436069,
            z: 521288629,,
            t: 0,
        }
    }
    get light() {return Math.random()}
    get secure() {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const value = array[0] / (0xFFFFFFFF + 1); // 0.0〜1.0
        return value;
    }
    get seed(seed) {
        const [x,y,z] = [123456789,362436069,521288629];
        const t = x ^ (this.x << 11);

        let t = this.x ^ (this.x << 11);
        this.x = this.y; this.y = this.z; this.z = this.w;
        return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 

        c
        this.x = 123456789;
        this.y = 362436069;
        this.z = 521288629;
        this.w = seed;

        let t = this.x ^ (this.x << 11);
        this.x = this.y; this.y = this.z; this.z = this.w;
        return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 


    }
}
