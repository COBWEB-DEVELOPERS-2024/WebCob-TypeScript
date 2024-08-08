// import { Agent } from './org/cobweb/cobweb2/core/Agent';
// import { SimulationInternals } from './org/cobweb/cobweb2/core/SimulationInternals';
// import { SimulationTimeSpace } from './org/cobweb/cobweb2/core/SimulationTimeSpace';

class AgentSpawner {
    private spawnType: any;
    private simulation: SimulationTimeSpace;

    constructor(classname: string, sim: SimulationTimeSpace) {
        this.simulation = sim;
        try {
            this.spawnType = require(classname);
        } catch (ex) {
            throw new Error(ex);
        }
    }

    spawn(type: number): Agent {
        try {
            return new this.spawnType(this.simulation, type);
        } catch (ex) {
            throw new Error(ex);
        }
    }
}

