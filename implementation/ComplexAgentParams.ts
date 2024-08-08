import { AgentFoodCountable } from './AgentFoodCountable';
import { ResizableParam } from './ResizableParam';
import { CloneHelper } from './CloneHelper';
import { MutatableFloat } from './MutatableFloat';
import { MutatableInt } from './MutatableInt';
import { FoodwebParams } from './FoodwebParams';

export class ComplexAgentParams implements ResizableParam {
    initialAgents: number = 20;
    foodEnergy: MutatableInt = new MutatableInt(100);
    otherFoodEnergy: MutatableInt = new MutatableInt(25);
    agentFoodEnergy: MutatableFloat = new MutatableFloat(1);
    breedEnergy: MutatableInt = new MutatableInt(60);
    asexPregnancyPeriod: MutatableInt = new MutatableInt(0);
    initEnergy: MutatableInt = new MutatableInt(100);
    stepEnergy: MutatableInt = new MutatableInt(1);
    stepRockEnergy: MutatableInt = new MutatableInt(2);
    stepAgentEnergy: MutatableInt = new MutatableInt(2);
    turnRightEnergy: MutatableInt = new MutatableInt(1);
    turnLeftEnergy: MutatableInt = new MutatableInt(1);
    mutationRate: MutatableFloat = new MutatableFloat(0.05);
    commSimMin: MutatableInt = new MutatableInt(0);
    sexualBreedChance: MutatableFloat = new MutatableFloat(1);
    asexualBreedChance: MutatableFloat = new MutatableFloat(0);
    breedSimMin: MutatableFloat = new MutatableFloat(0);
    sexualPregnancyPeriod: MutatableInt = new MutatableInt(5);
    agingMode: boolean = false;
    agingLimit: MutatableInt = new MutatableInt(300);
    agingRate: MutatableFloat = new MutatableFloat(10);
    pdMemory: number = 10;
    broadcastMode: boolean = false;
    broadcastEnergyBased: boolean = false;
    broadcastFixedRange: MutatableInt = new MutatableInt(20);
    broadcastEnergyMin: MutatableInt = new MutatableInt(20);
    broadcastEnergyCost: MutatableInt = new MutatableInt(5);
    broadcastSameTypeOnly: boolean = false;
    broadcastMinSimilarity: MutatableFloat = new MutatableFloat(0);
    partnerType: MutatableInt = new MutatableInt(-1);
    poop: MutatableInt = new MutatableInt(-1);
    childType: MutatableInt = new MutatableInt(-1);
    probGiveBirthToOtherType: MutatableFloat = new MutatableFloat(0);
    foodweb: FoodwebParams;

    constructor(env: AgentFoodCountable) {
        this.foodweb = new FoodwebParams(env);
    }

    clone(): ComplexAgentParams {
        const copy = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        CloneHelper.resetMutatable(copy);
        return copy;
    }

    resize(envParams: AgentFoodCountable): void {
        this.foodweb.resize(envParams);
    }
}