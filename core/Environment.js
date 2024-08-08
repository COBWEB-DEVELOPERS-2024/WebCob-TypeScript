/**
 * The Environment class represents the simulation world; a collection of
 * locations with state, each of which may contain an agent.
 *
 * The Environment class is designed to handle an arbitrary number of
 * dimensions, although the UIInterface is somewhat tied to two dimensions for
 * display purposes.
 *
 * All access to the internal data of the Environment is done through an
 * accessor class, Environment.Location. The practical upshot of this is that
 * the Environment internals may be implemented in C or C++ using JNI, while the
 * Java code still has a nice java flavoured interface to the data.
 *
 * Another advantage of the accessor model is that the internal data need not be
 * in a format that is reasonable for external access. An flagArray of longs where
 * bitfields represent the location states makes sense in this context, because
 * the accessors allow friendly access to this state information.
 *
 * Furthermore, the accessor is designed to be quite general; there should be no
 * need to subclass Environment.Location for a specific Environment
 * implementation. A number of constants should be defined in an Environment
 * implementation to allow agents to interpret the state information of a
 * location, so agents will need to be somewhat aware of the specific
 * environment they are operating in, but all access should be through this
 * interface, using implementation specific access constants.
 */

class Environment {
    constructor(simulation) {
        this.simulation = simulation;
        this.topology = null; // Will be initialized in the load method
        this.agentTable = new Map();
        this.flagArray = [];
        this.foodTypeArray = [];
        this.dropArray = [];
    }

    load(width, height, wrap, keepOldArray) {
        this.topology = new Topology(this.simulation, width, height, wrap);

        if (keepOldArray) {
            this.flagArray = ArrayUtilities.resizeArray(this.flagArray, this.topology.width, this.topology.height);
            this.foodTypeArray = ArrayUtilities.resizeArray(this.foodTypeArray, this.topology.width, this.topology.height);
        } else {
            this.flagArray = new Array(this.topology.width).fill().map(() => new Array(this.topology.height).fill(0));
            this.foodTypeArray = new Array(this.topology.width).fill().map(() => new Array(this.topology.height).fill(0));
        }
        this.dropArray = ArrayUtilities.resizeArray(this.dropArray, this.topology.width, this.topology.height);
    }

    clearAgents() {
        for (let agent of this.getAgents()) {
            agent.die();
        }
        this.agentTable.clear();
    }

    getAgent(l) {
        return this.agentTable.get(l);
    }

    getAgents() {
        return this.agentTable.values();
    }

    getAgentCount() {
        return this.agentTable.size;
    }

    getClosestAgent(agent) {
        let l1 = agent.getPosition();
        let closest = null;
        let closestDistance = Math.sqrt(this.topology.width * this.topology.width + this.topology.height * this.topology.height);

        for (let [key, value] of this.agentTable.entries()) {
            let distance = this.topology.getDistance(key, l1);
            if (distance < closestDistance) {
                closest = value;
                closestDistance = distance;
            }
        }
        return closest;
    }

    setAgent(l, a) {
        if (a !== null) {
            this.agentTable.set(l, a);
        } else {
            this.agentTable.delete(l);
        }
    }

    getLocationBits(l) {
        return this.flagArray[l.x][l.y];
    }

    setLocationBits(l, bits) {
        this.flagArray[l.x][l.y] = bits;
    }

    setFlag(l, flag, state) {
        let flagBits = 1 << (flag - 1);

        if (state) {
            this.setLocationBits(l, this.getLocationBits(l) | flagBits);
        } else {
            this.setLocationBits(l, this.getLocationBits(l) & ~flagBits);
        }
    }

    testFlag(l, flag) {
        let flagBits = 1 << (flag - 1);
        return (this.getLocationBits(l) & flagBits) !== 0;
    }

    getFoodType(l) {
        return this.foodTypeArray[l.x][l.y];
    }

    addFood(l, type) {
        if (this.hasStone(l)) {
            throw new Error("stone here already");
        }
        this.setFlag(l, Environment.FLAG_FOOD, true);
        this.foodTypeArray[l.x][l.y] = type;
    }

    clearFood() {
        this.clearFlag(Environment.FLAG_FOOD);
    }

    removeFood(l) {
        this.setFlag(l, Environment.FLAG_FOOD, false);
    }

    hasFood(l) {
        return this.testFlag(l, Environment.FLAG_FOOD);
    }

    clearFlag(flag) {
        for (let x = 0; x < this.topology.width; ++x) {
            for (let y = 0; y < this.topology.height; ++y) {
                let currentPos = new Location(x, y);

                if (this.testFlag(currentPos, flag)) {
                    if (flag === Environment.FLAG_DROP) {
                        this.removeDrop(currentPos);
                    } else {
                        this.setFlag(currentPos, flag, false);
                    }
                }
            }
        }
    }

    addStone(l) {
        if (this.hasAgent(l)) {
            return;
        }

        if (this.hasFood(l)) {
            this.removeFood(l);
        }

        if (this.testFlag(l, Environment.FLAG_DROP)) {
            this.setFlag(l, Environment.FLAG_DROP, false);
        }

        this.setFlag(l, Environment.FLAG_STONE, true);
    }

    clearStones() {
        this.clearFlag(Environment.FLAG_STONE);
    }

    hasAnythingAt(l) {
        return this.getLocationBits(l) !== 0 || this.hasAgent(l);
    }

    removeStone(l) {
        this.setFlag(l, Environment.FLAG_STONE, false);
    }

    addDrop(loc, d) {
        if (this.hasFood(loc)) {
            this.removeFood(loc);
        }

        this.setFlag(loc, Environment.FLAG_DROP, true);

        this.dropArray[loc.x][loc.y] = d;
    }

    removeDrop(loc) {
        if (this.hasDrop(loc)) {
            let drop = this.dropArray[loc.x][loc.y];
            drop.prepareRemove();
            this.setFlag(loc, Environment.FLAG_DROP, false);
            this.dropArray[loc.x][loc.y] = null;
        }
    }

    getDrop(loc) {
        return this.dropArray[loc.x][loc.y];
    }

    hasDrop(loc) {
        return this.testFlag(loc, Environment.FLAG_DROP);
    }

    hasStone(l) {
        return this.testFlag(l, Environment.FLAG_STONE);
    }

    hasAgent(l) {
        return this.getAgent(l) !== undefined;
    }

    clearDrops() {
        this.clearFlag(Environment.FLAG_DROP);
    }

    killOffgridAgents() {
        for (let agent of this.getAgents()) {
            let l = agent.getPosition();
            if (l.x >= this.topology.width || l.y >= this.topology.height) {
                agent.die();
            }
        }
    }

    removeAgent(l) {
        let a = this.getAgent(l);
        if (a !== undefined) {
            a.die();
        }
    }

    update() {
        // nothing
    }

    getNearLocations(position) {
        let result = [];
        for (let dir of this.topology.ALL_8_WAY) {
            let loc = this.topology.getAdjacent(position, dir);
            if (loc !== null && !this.hasStone(loc)) {
                result.push(loc);
            }
        }
        return result;
    }
}

// Constants
Environment.FLAG_STONE = 1;
Environment.FLAG_FOOD = 2;
Environment.FLAG_AGENT = 3;
Environment.FLAG_DROP = 4;

// Example usage
let simulation = new SimulationInternals();
let environment = new Environment(simulation);
environment.load(100, 100, true, true);
