import { AgentFoodCountable } from './AgentFoodCountable';
import { ResizableParam } from './ResizableParam';

/**
 * Food web parameters for an agent.
 */
export class FoodwebParams implements ResizableParam {
    /**
     * If this agent can eat Agent type 1 canEatAgents[0] is true.
     */
    @ConfDisplayName("Agent")
    @ConfSquishParent
    @ConfList({ indexName: "agent", startAtOne: true })
    public canEatAgent: boolean[] = [];

    /**
     * If this agent can eat Food type 1 canEatFood[0] is true.
     */
    @ConfDisplayName("Food")
    @ConfSquishParent
    @ConfList({ indexName: "food", startAtOne: true })
    public canEatFood: boolean[] = [];

    constructor(env: AgentFoodCountable) {
        this.resize(env);
    }

    public resize(envParams: AgentFoodCountable): void {
        this.canEatAgent = this.canEatAgent.slice(0, envParams.getAgentTypes());

        const oldSize = this.canEatFood.length;
        this.canEatFood = this.canEatFood.slice(0, envParams.getAgentTypes());
        // agents can eat all food by default
        for (let i = oldSize; i < this.canEatFood.length; i++) {
            this.canEatFood[i] = true;
        }
    }
}