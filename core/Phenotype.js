/**
 * Property of an agent that can be modified
 */
class Phenotype {

    /**
     * Modifies Phenotype of agent using linear transformation formula
     * p' = p * m + b
     * @param cause Cause/source of modification. Used to keep track of multiple multipliers on the same phenotype
     * @param a Agent to modify
     * @param m scale factor
     */
    modifyValue(cause, a, m) {
        // To be implemented by subclasses
        throw new Error('Method not implemented');
    }

    /**
     * Undoes any modification done by this cause
     * @param cause Cause/source of modification. Used to keep track of multiple multipliers on the same phenotype
     * @param a Agent to modify
     */
    unmodifyValue(cause, a) {
        // To be implemented by subclasses
        throw new Error('Method not implemented');
    }

    toString() {
        return this.getName();
    }
}
