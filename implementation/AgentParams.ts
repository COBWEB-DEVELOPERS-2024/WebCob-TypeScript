// import { AgentFoodCountable } from '../core/AgentFoodCountable';
// import { PerAgentParams } from '../plugins/PerAgentParams';
// import { ComplexAgentParams } from './ComplexAgentParams';

export class AgentParams extends PerAgentParams<ComplexAgentParams> {
  private size: AgentFoodCountable;

  constructor(size: AgentFoodCountable) {
    super(ComplexAgentParams);
    this.size = size;
    this.resize(size);
  }

  protected newAgentParam(): ComplexAgentParams {
    return new ComplexAgentParams(this.size);
  }

  public resize(envParams: AgentFoodCountable): void {
    this.size = envParams;
    super.resize(this.size);

    for (const complexAgentParams of this.agentParams) { // TODO? envparams?
      complexAgentParams.resize(this.size);
    }
  }

  private static readonly serialVersionUID = 2; //I don't know what this is for
}

