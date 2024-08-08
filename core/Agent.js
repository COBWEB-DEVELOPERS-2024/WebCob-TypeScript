// Define a namespace similar to Java's package structure
const org = {};
org.cobweb = {};
org.cobweb.cobweb2 = {};
org.cobweb.cobweb2.core = {};

class Agent {

    /** Basic Properties of an Agent **/
    constructor(type, id) {
        this.alive = true;
        this.position = null;   // dependent on LocationDirection
        this.energy = 0;        // obtainable; agent uses it to do things
        this.type = type;
        this.id = id;           // whoever wrote this just put id randomly in the class so i'm not sure what to do with it
    }

    /** Getters **/
    /** @returns {boolean} true if the agent is alive*/
    isAlive() {
        return this.alive;
    }

    /** @returns {LocationDirection} */
    getPosition() {
        return this.position;
    }

    /** @returns {int} energy level */
    getEnergy() {
        return this.energy;
    }

    /** @returns {int} int signifying the type of agent */
    getType() {
        return this.type;
    }

    /** Changes an agent's 'alive' status
     * @returns {void} */
    die() {
        if (!this.isAlive()) {
            return;
        }
        this.alive = false;
    }

    /**@returns {boolean}*/
    enoughEnergy(required) {
        return this.getEnergy() >= required;
    }

    /** Changes the agent's energy level.
     * @param {number} delta - Energy change delta, positive means agent gains energy, negative means it loses
     * @param {Cause} cause - Why the energy changed.
     **/
    changeEnergy(delta, cause) {
        this.energy += delta;
    }

    /** Abstract method definition**/
    takeapoop(location ) {
        return null
    }

    /** Abstract method definition for creating a child agent asexually **/
    createChildAsexual(location) {
        return null;
    }
}

