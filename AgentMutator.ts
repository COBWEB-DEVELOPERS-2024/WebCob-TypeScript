export interface AgentState {
    // Define the structure of AgentState according to your needs
}

export interface AgentMutator {
    /**
     * Checks whether this mutator can use given AgentState in the current simulation configuration
     */
    acceptsState<T extends AgentState>(type: new () => T, value: T): boolean;
}