/**
 * Phenotype that does nothing
 */
class NullPhenotype extends Phenotype {
    modifyValue(cause, a, m) {
        // Nothing to modify
    }

    unmodifyValue(cause, a) {
        // Nothing to unmodify
    }

    getIdentifier() {
        return "None";
    }

    getName() {
        return "[Null]";
    }
}

