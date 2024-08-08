/**
 * Represents the topology of a 2D grid environment
 */
class Topology {
    constructor(randomSource, width, height, wrap) {
        this.randomSource = randomSource;
        this.width = width;
        this.height = height;
        this.wrap = wrap;
    }

    getAdjacent(location, direction) {
        const x = location.x + direction.x;
        const y = location.y + direction.y;

        if (this.wrap) {
            let wrappedX = (x + this.width) % this.width;
            let wrappedY = y;

            if (y < 0) {
                wrappedY = -y - 1;
                wrappedX = (x + Math.floor(this.width / 2)) % this.width;
                direction = new Direction(-direction.x, -direction.y);
            } else if (y >= this.height) {
                wrappedY = this.height * 2 - y - 1;
                wrappedX = (x + Math.floor(this.width / 2)) % this.width;
                direction = new Direction(-direction.x, -direction.y);
            }

            return new LocationDirection(new Location(wrappedX, wrappedY), direction);
        } else {
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                return null;
            } else {
                return new Location(x, y);
            }
        }
    }

    getDistance(from, to) {
        return Math.sqrt(this.getDistanceSquared(from, to));
    }

    getDistanceSquared(from, to) {
        const closestWrapLocation = this.getClosestWrapLocation(from, to);
        return this.simpleDistanceSquared(from, closestWrapLocation);
    }

    simpleDistanceSquared(from, to) {
        const deltaX = to.x - from.x;
        const deltaY = to.y - from.y;
        return deltaX * deltaX + deltaY * deltaY;
    }

    getClosestWrapLocation(zero, target) {
        if (!this.wrap) {
            return target;
        }

        let distance = Number.MAX_VALUE;
        let best = target;

        this.getWrapVirtualLocations(target).forEach(virtual => {
            const d = this.simpleDistanceSquared(zero, virtual);
            if (d < distance) {
                distance = d;
                best = virtual;
            }
        });

        return best;
    }

    getWrapVirtualLocations(l) {
        const result = [l];

        if (this.wrap) {
            result.push(new Location(l.x - this.width, l.y)); // wrap left
            result.push(new Location(l.x + this.width, l.y)); // wrap right
            result.push(new Location(l.x - this.width + Math.floor(this.width / 2), 2 * this.height - l.y - 1)); // wrap down left
            result.push(new Location(l.x + Math.floor(this.width / 2), 2 * this.height - l.y - 1)); // wrap down right
            result.push(new Location(l.x - this.width + Math.floor(this.width / 2), -l.y - 1)); // wrap up left
            result.push(new Location(l.x + Math.floor(this.width / 2), -l.y - 1)); // wrap up right
        }

        return result;
    }

    isValidLocation(l) {
        return l !== null &&
            l.x >= 0 && l.x < this.width &&
            l.y >= 0 && l.y < this.height;
    }

    getArea(zero, radius) {
        const result = new Set();
        const rSquared = radius * radius;

        if (!this.wrap) {
            const x0 = Math.min(zero.x - Math.ceil(radius), 0);
            const x1 = Math.max(zero.x + Math.ceil(radius), this.width - 1);
            const y0 = Math.min(zero.y - Math.ceil(radius), 0);
            const y1 = Math.max(zero.y + Math.ceil(radius), this.height - 1);

            for (let x = x0; x < x1; x++) {
                for (let y = y0; y < y1; y++) {
                    const l = new Location(x, y);
                    if (this.getDistanceSquared(zero, l) <= rSquared) {
                        result.add(l);
                    }
                }
            }
        } else {
            if (radius > Math.max(this.width, this.height)) {
                radius = Math.max(this.width, this.height);
            }

            result.add(zero);
            let l = new LocationDirection(zero, NORTH);

            for (let r = 1; r <= radius; r++) {
                l = this.getAdjacent(l);
                result.add(l);

                const sides = [r, r * 2, r * 2, r * 2, r - 1];

                sides.forEach(side => {
                    l = this.getTurnRightPosition(l);
                    for (let i = 0; i < side; i++) {
                        l = this.getAdjacent(l);
                        if (this.getDistanceSquared(zero, l) <= rSquared) {
                            result.add(l);
                        }
                    }
                });

                l = this.getAdjacent(l);
                l = this.getTurnLeftPosition(l);
            }
        }

        return result;
    }

    getTurnRightPosition(location) {
        return new LocationDirection(location, this.turnRight(location.direction));
    }

    getTurnLeftPosition(location) {
        return new LocationDirection(location, this.turnLeft(location.direction));
    }

    turnRight(dir) {
        return new Direction(-dir.y, dir.x);
    }

    turnLeft(dir) {
        return new Direction(dir.y, -dir.x);
    }

    getRotationBetween(from, to) {
        if (from.equals(to)) {
            return Rotation.None;
        } else if (this.turnRight(from).equals(to)) {
            return Rotation.Right;
        } else if (this.turnLeft(from).equals(to)) {
            return Rotation.Left;
        } else {
            return Rotation.UTurn;
        }
    }

    getDirectionBetween4way(from, to) {
        to = this.getClosestWrapLocation(from, to);

        const deltaX = to.x - from.x;
        const deltaY = to.y - from.y;

        if (deltaX === 0 && deltaY === 0) {
            return Direction.NONE;
        }

        const division = Math.atan2(deltaY, deltaX) / Math.PI * 4;

        if (division >= -3 && division < -1) {
            return Direction.NORTH;
        } else if (division >= -1 && division < 1) {
            return Direction.EAST;
        } else if (division >= 1 && division < 3) {
            return Direction.SOUTH;
        } else {
            return Direction.WEST;
        }
    }

    getDirectionBetween8way(from, to) {
        to = this.getClosestWrapLocation(from, to);

        const deltaX = to.x - from.x;
        const deltaY = to.y - from.y;

        if (deltaX === 0 && deltaY === 0) {
            return Direction.NONE;
        }

        const division = Math.atan2(deltaY, deltaX) / Math.PI * 8;

        if (division >= -7 && division < -5) {
            return Direction.NORTHWEST;
        } else if (division >= -5 && division < -3) {
            return Direction.NORTH;
        } else if (division >= -3 && division < -1) {
            return Direction.NORTHEAST;
        } else if (division >= -1 && division < 1) {
            return Direction.EAST;
        } else if (division >= 1 && division < 3) {
            return Direction.SOUTHEAST;
        } else if (division >= 3 && division < 5) {
            return Direction.SOUTH;
        } else if (division >= 5 && division < 7) {
            return Direction.SOUTHWEST;
        } else {
            return Direction.WEST;
        }
    }

    getRandomDirection() {
        const i = this.randomSource.getRandom().nextInt(this.ALL_4_WAY.length);
        return this.ALL_4_WAY[i];
    }
}

// Some predefined directions for 2D
const directions = {
    NONE: new Direction(0, 0),
    NORTH: new Direction(0, -1),
    EAST: new Direction(1, 0),
    SOUTH: new Direction(0, 1),
    WEST: new Direction(-1, 0),
    NORTHEAST: new Direction(1, -1),
    SOUTHEAST: new Direction(1, 1),
    SOUTHWEST: new Direction(-1, 1),
    NORTHWEST: new Direction(-1, -1)
};

const Rotation = {
    None: 'None',
    Right: 'Right',
    UTurn: 'UTurn',
    Left: 'Left'
};
