import { Agent } from './Agent';
import { Drop } from './Drop';
import { Environment } from './Environment';
import { Location } from './Location';
import { LocationDirection } from './LocationDirection';
import { SimulationInternals } from './SimulationInternals';
import { EnvironmentMutator } from './EnvironmentMutator';
import { ComplexAgentParams } from './ComplexAgentParams';
import { ComplexEnvironmentParams } from './ComplexEnvironmentParams';

export class ComplexEnvironment extends Environment {
    protected agentData: ComplexAgentParams[];

    public data: ComplexEnvironmentParams = new ComplexEnvironmentParams();

    private plugins: Map<new () => EnvironmentMutator, EnvironmentMutator> = new Map();

    constructor(simulation: SimulationInternals) {
        super(simulation);
    }

    public async addAgent(l: Location, type: number): Promise<void> {
        if (!this.hasAgent(l) && !this.hasStone(l) && !this.hasDrop(l)) {
            const agentType = type;
            await this.spawnAgent(new LocationDirection(l), agentType);
        }
    }

    protected async spawnAgent(location: LocationDirection, agentType: number): Promise<Agent> {
        const child = await this.simulation.newAgent(agentType) as ComplexAgent;
        const params = this.agentData[agentType];
        child.init(this, location, params, params.initEnergy.getValue());
        return child;
    }

    public async setParams(envParams: ComplexEnvironmentParams, agentParams: { agentParams: ComplexAgentParams[] }, keepOldAgents: boolean, keepOldArray: boolean, keepOldDrops: boolean): Promise<void> {
        this.data = envParams;
        this.agentData = agentParams.agentParams;

        await super.load(this.data.width, this.data.height, this.data.wrapMap, keepOldArray);

        if (keepOldAgents) {
            this.killOffgridAgents();
            this.loadOldAgents();
        } else {
            this.agentTable.clear();
        }

        if (!keepOldDrops) {
            this.clearDrops();
        }
    }

    public loadNew(): void {
        for (let i = 0; i < this.data.initialStones; ++i) {
            let l: Location;
            let tries = 0;
            do {
                l = this.topology.getRandomLocation();
            } while (tries++ < 100 && (this.hasStone(l) || this.hasDrop(l) || this.hasAgent(l)));
            if (tries < 100) this.addStone(l);
        }

        for (const p of this.plugins.values()) {
            p.loadNew();
        }
    }

    public loadNewAgents(): void {
        for (let i = 0; i < this.agentData.length; ++i) {
            for (let j = 0; j < this.agentData[i].initialAgents; ++j) {
                let location: Location;
                let tries = 0;
                do {
                    location = this.topology.getRandomLocation();
                } while (tries++ < 100 && (this.hasAgent(location) || this.hasStone(location) || this.hasDrop(location)));
                if (tries < 100) {
                    const agentType = i;
                    this.spawnAgent(new LocationDirection(location), agentType);
                }
            }
        }
    }

    private loadOldAgents(): void {
        for (let x = 0; x < this.topology.width; ++x) {
            for (let y = 0; y < this.topology.height; ++y) {
                const currentPos = new Location(x, y);
                const agent = this.getAgent(currentPos) as ComplexAgent;
                if (agent) {
                    const theType = agent.getType();
                    agent.setParams(this.agentData[theType]);
                }
            }
        }
    }

    public async update(): Promise<void> {
        await super.update();
        this.updateDrops();

        for (const v of this.plugins.values()) {
            v.update();
        }
    }

    public addPlugin<T extends EnvironmentMutator>(plugin: T): void {
        this.plugins.set(plugin.constructor as new () => T, plugin);
    }

    public getPlugin<T extends EnvironmentMutator>(type: new () => T): T | undefined {
        return this.plugins.get(type) as T;
    }

    private updateDrops(): void {
        for (let x = 0; x < this.topology.width; x++) {
            for (let y = 0; y < this.topology.height; y++) {
                const l = new Location(x, y);
                if (!this.hasDrop(l)) continue;
                const d = this.getDrop(l);
                d.update();
            }
        }
    }
}