import { AgentFoodCountable } from './AgentFoodCountable';

export interface SimulationParams extends AgentFoodCountable {
    getPluginParameters(): string[];
}