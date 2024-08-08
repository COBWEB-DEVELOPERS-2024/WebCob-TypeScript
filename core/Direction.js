/** 2D direction represented as X and Y deltas
 * -1 < x < 1
 * -1 < y < 1
 */

class Direction {
    constructor(x, y) {
        this.x = Math.sign(x);
        this.y = Math.sign(y);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    hashCode() {
        return ((this.y & 0xffff) << 16) | (this.x & 0xffff);
    }

    toString() {
        return `(${this.x},${this.y})`;
    }
}
