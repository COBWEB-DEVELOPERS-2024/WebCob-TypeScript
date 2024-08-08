/** Location on a 2D grid. */

class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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

