/** LocationDirection extends Location with a Direction. */

class LocationDirection extends Location {
    constructor(l, d) {
        super(l.x, l.y);
        this.direction = d;
    }

    // Optional constructor if direction is not provided
    static fromLocation(l) {
        return new LocationDirection(l, Topology.NONE);
    }
}


