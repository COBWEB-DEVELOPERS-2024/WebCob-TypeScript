import { Controller } from './Controller';
import { SimulationInternals } from './SimulationInternals';
import { ResizableParam } from './ResizableParam';

/**
 * Configuration for a Controller
 */
export interface ControllerParams extends ResizableParam {
    /**
     * Creates Controller for given agent type
     * @param sim simulation the agent is in
     * @param type agent type
     * @return Controller for agent
     */
    createController(sim: SimulationInternals, type: number): Controller;
}