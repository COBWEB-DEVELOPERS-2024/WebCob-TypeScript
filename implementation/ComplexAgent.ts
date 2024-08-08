// package org.cobweb.cobweb2.impl;
//
// import java.util.Collection;
// import java.util.HashMap;
// import java.util.Map;
// import java.util.Random;
//
// import org.apache.commons.collections4.queue.CircularFifoQueue;
// import org.cobweb.cobweb2.core.Agent;
// import org.cobweb.cobweb2.core.AgentListener;
// import org.cobweb.cobweb2.core.Cause;
// import org.cobweb.cobweb2.core.Controller;
// import org.cobweb.cobweb2.core.Drop;
// import org.cobweb.cobweb2.core.Location;
// import org.cobweb.cobweb2.core.LocationDirection;
// import org.cobweb.cobweb2.core.SimulationInternals;
// import org.cobweb.cobweb2.core.Topology;
// import org.cobweb.cobweb2.plugins.AgentState;
// import org.cobweb.cobweb2.plugins.broadcast.BroadcastPacket;
// import org.cobweb.cobweb2.plugins.broadcast.FoodBroadcast;
// import org.cobweb.cobweb2.plugins.broadcast.PacketConduit;
// import org.cobweb.cobweb2.plugins.broadcast.PacketConduit.BroadcastCause;
// import org.cobweb.cobweb2.plugins.broadcast.PacketConduit.BroadcastFoodCause;
// import org.cobweb.util.RandomNoGenerator;

/**
 *
 * <p>During each tick of a simulation, each ComplexAgent instance will
 * be used to call the tickNotification method.  This is done in the
 * TickScheduler.doTick private method.
 *
 * @see Agent
 * @see java.io.Serializable
 *
 */
public class ComplexAgent extends Agent {

    public ComplexAgentParams params;

    private double commInbox;

    private double commOutbox;

    /**
     * IDs of bad agents. Cheaters, etc
     */
    private Collection<Agent> badAgentMemory;

    private double memoryBuffer;


    protected ComplexAgent breedPartner;

    // FIXME: AI should call asexBreed() instead of setting flag and agent doing so.
    private boolean shouldReproduceAsex;

    // pregnancyPeriod is set value while pregPeriod constantly changes
    protected int pregPeriod;

    protected boolean pregnant = false;

    public Map<Class<? extends AgentState>, AgentState> extraState = new HashMap<>();

    public transient ComplexEnvironment environment;

    protected transient SimulationInternals simulation;

    long birthTick;

    public ComplexAgent(SimulationInternals sim, int type) {
    super(type);
    this.simulation = sim;
    this.birthTick = getTime();
}

private Controller controller;

protected AgentListener getAgentListener() {
    return simulation.getAgentListener();
}

protected long getTime() {
    return simulation.getTime();
}

protected RandomNoGenerator getRandom() {
    return simulation.getRandom();
}

public float calculateSimilarity(ComplexAgent other) {
    return simulation.getSimilarityCalculator().similarity(this, other);
}

public <T extends AgentState> void setState(Class<T> type, T value) {
    extraState.put(type, value);
}

public <T extends AgentState> T getState(Class<T> type) {
@SuppressWarnings("unchecked")
    T storedState = (T) extraState.get(type);
    return storedState;
}

public <T extends AgentState> T removeState(Class<T> type) {
@SuppressWarnings("unchecked")
    T removed = (T) extraState.remove(type);
    return removed;
}

@Override
protected ComplexAgent createChildAsexual(LocationDirection location) {
    ComplexAgent child = new ComplexAgent(simulation, getType());
    child.init(environment, location, this);
    return child;
}

@Override
public int takeapoop(LocationDirection location) {
    int shittype = params.poop.getValue();
    if(shittype != -1){
        ComplexAgent child = new ComplexAgent(simulation, shittype);
        child.init(environment, location, this);
        System.out.println("I just took a shit");
        return 1;
    }
    else{
        return 0;
    }
}

//prob = probability of creating a child of another type
private ComplexAgent createChildSexual(LocationDirection location, ComplexAgent otherParent) {
    ComplexAgent child;
    if(getType() != otherParent.getType()){
        float probOfOtherType = params.probGiveBirthToOtherType.getValue();
        float probGiveBirthToSameType = probOfOtherType + (1 - probOfOtherType)/2;
        Random rand = new Random();

        float n = rand.nextFloat();

        if(n <= probOfOtherType){
            child = new ComplexAgent(simulation, params.childType.getValue()- 1);

        }else if(n <= probGiveBirthToSameType){
            child = new ComplexAgent(simulation, getType());
        }else{
            child = new ComplexAgent(simulation, otherParent.getType());
        }
    }else{
        child = new ComplexAgent(simulation, getType());
    }
    child.init(environment, location, this, otherParent);
    return child;
}

/**
 * Constructor with two parents
 *
 * @param pos spawn position
 * @param parent1 first parent
 * @param parent2 second parent
 */
protected void init(ComplexEnvironment env, LocationDirection pos, ComplexAgent parent1, ComplexAgent parent2) {
    environment = env;
    copyParams(parent1);
    controller =
        parent1.controller.createChildSexual(
            parent2.controller);

    getAgentListener().onSpawn(this, parent1, parent2);

    initPosition(pos);

    changeEnergy(params.initEnergy.getValue(), new SexualBirthCause());
}


/**
 * Constructor with a parent; standard asexual copy
 *
 * @param pos spawn position
 * @param parent parent
 */
protected void init(ComplexEnvironment env, LocationDirection pos, ComplexAgent parent) {
    environment = (env);
    copyParams(parent);
    controller = parent.controller.createChildAsexual();

    getAgentListener().onSpawn(this, parent);

    initPosition(pos);

    changeEnergy(params.initEnergy.getValue(), new AsexualBirthCause());
}

/**
 * Constructor with no parent agent; creates an agent using "immaculate conception" technique
 * @param pos spawn position
 * @param agentData agent parameters
 */
public void init(ComplexEnvironment env, LocationDirection pos, ComplexAgentParams agentData, int energy) {
    environment = (env);
    setParams(agentData);

    getAgentListener().onSpawn(this);

    initPosition(pos);

    changeEnergy(energy, new CreationBirthCause());
}

public void setController(Controller c) {
    this.controller = c;
}

/**
 * Sends out given broadcast
 */
public void broadcast(BroadcastPacket packet, BroadcastCause cause) {
    //TODO move to plugin?
    environment.getPlugin(PacketConduit.class).addPacketToList(packet);

    changeEnergy(-params.broadcastEnergyCost.getValue(), cause);
}

/**
 * @return True if agent has enough energy to broadcast
 */
protected boolean canBroadcast() {
    return params.broadcastMode && enoughEnergy(params.broadcastEnergyMin.getValue());
}

/**
 * @param destPos The location of the agents next position.
 * @return True if agent can eat this type of food.
 */
public boolean canEat(Location destPos) {
    return params.foodweb.canEatFood[environment.getFoodType(destPos)];
}

/**
 * @param adjacentAgent The agent attempting to eat.
 * @return True if the agent can eat this type of agent.
 */
protected boolean canEat(ComplexAgent adjacentAgent) {
    boolean caneat = false;
    caneat = params.foodweb.canEatAgent[adjacentAgent.getType()];
    if (enoughEnergy(params.breedEnergy.getValue()))
        caneat = false;

    return caneat;
}

/**
 * @param destPos The location of the agents next position.
 * @return True if location exists and is not occupied by anything
 */
protected boolean canStep(Location destPos) {
    // The position must be valid...
    if (destPos == null)
        return false;
    // and the destination must be clear of stones
    if (environment.hasStone(destPos))
        return false;
    // and clear of wastes
    if (environment.hasDrop(destPos))
        return environment.getDrop(destPos).canStep(this);
    // as well as other agents...
    if (environment.hasAgent(destPos))
        return false;
    return true;
}

public boolean isAgentGood(ComplexAgent other) {
    if (!badAgentMemory.contains(other))
        return true;

    // Refresh memory
    rememberBadAgent(other);
    return false;
}

protected void communicate(ComplexAgent target) {
    target.setCommInbox(getCommOutbox());
}

private void copyParams(ComplexAgent p) {
    // Copies default constants for this agent type, not directly from agent
    setParams(environment.agentData[p.getType()]);
}

@Override
public void die() {
    super.die();

    changeEnergy(Math.min(0, -getEnergy()), new DeathCause());

    getAgentListener().onDeath(this);

    move(null);

    // Release references to other agents
    badAgentMemory.clear();
}

/**
 * The agent eats the food (food flag is set to false), and
 * gains energy and waste according to the food type.
 *
 * @param destPos Location of food.
 */
public void eat(Location destPos) {
    // TODO: CHECK if setting flag before determining type is ok
    // Eat first before we do anything else
    int foodType = environment.getFoodType(destPos);

    // Remove food from world
    environment.removeFood(destPos);

    if (foodType == getType()) {
        changeEnergy(+params.foodEnergy.getValue(), new EatFavoriteFoodCause());
    } else {
        changeEnergy(+params.otherFoodEnergy.getValue(), new EatFoodCause());
    }

    getAgentListener().onConsumeFood(this, foodType);
}

/**
 * Eats an adjacent agent. Agent gains energy according to the type of agent eaten.
 *
 * @param adjacentAgent The agent being eaten.
 */
protected void eat(ComplexAgent adjacentAgent) {
    // Eat agent
    float gain = (adjacentAgent.getEnergy() * params.agentFoodEnergy.getValue());
    changeEnergy(+gain, new EatAgentCause());

    getAgentListener().onConsumeAgent(this, adjacentAgent);
    adjacentAgent.die();
}

/**
 * If agent ages, the older the agent, the more energy the agent will use.
 * This method determines the amount of energy lost per tick.
 *
 * @return Energy lost due to agent aging.
 */
public float energyPenalty() {
    if (!params.agingMode)
        return 0;

    long tempAge = getAge();
    float penaltyValue = Math.min(Math.max(0, getEnergy()), (params.agingRate.getValue()
        * (float) Math.tan((tempAge / (float) params.agingLimit.getValue()) * 89.99f * Math.PI / 180f)));

    return penaltyValue;
}

@Override
public Agent getAdjacentAgent() {
    Location destPos = environment.topology.getAdjacent(getPosition());
    if (destPos == null)
        return null;

    return environment.getAgent(destPos);
}

/**
 * Returns the age of the agent as the difference between
 * current time and birth time.
 *
 * @return The agent's age
 */
public long getAge() {
    return getTime() - birthTick;
}

public double getCommInbox() {
    return commInbox;
}

public double getCommOutbox() {
    return commOutbox;
}

public double getMemoryBuffer() {
    return memoryBuffer;
}

private void initPosition(LocationDirection pos) {
    if (pos.direction.equals(Topology.NONE))
        pos = new LocationDirection(pos, simulation.getTopology().getRandomDirection());

    move(pos);

    simulation.addAgent(this);
}

public void rememberBadAgent(Agent cheater) {
    if (cheater.equals(this))
        return;
    badAgentMemory.remove(cheater);
    badAgentMemory.add(cheater);
}

/**
 * The agent moves to the new position if it is
 * within the environment.
 *
 * @param newPos The new position of the agent.
 */
public void move(LocationDirection newPos) {
    Location oldPos = getPosition();

    if (oldPos != null && newPos != null)
        newPos = getAgentListener().onTryStep(this, oldPos, newPos);

    if (oldPos != null)
        environment.setAgent(oldPos, null);

    if (newPos != null)
        environment.setAgent(newPos, this);

    getAgentListener().onStep(this, oldPos, newPos);

    this.position = newPos;
}

/**
 * Agent receives the broadcast.
 */
protected void receiveBroadcast() {
    BroadcastPacket commPacket = environment.getPlugin(PacketConduit.class).findPacket(this);
    if (commPacket == null)
        return;
    if (commPacket instanceof FoodBroadcast) {
        LocationDirection foodLoc = ((FoodBroadcast) commPacket).getFoodLoc();
        // Receive broadcast
        setMemoryBuffer(foodLoc.location.distance(getPosition()));
        if (foodLoc.location.distance(getPosition()) == 1) {
            setCommOutbox(2);
        }
        if (foodLoc.location.distance(getPosition()) == 0) {
            setCommOutbox(3);
        }
        if (foodLoc.location.distance(getPosition()) > 1) {
            setCommOutbox(1);
        }
        changeEnergy(-params.broadcastEnergyCost.getValue(), new BroadcastFoodCause());
    }
}

public void reproduceSexually(LocationDirection location, ComplexAgent partner) {
    breedPartner = partner;
    pregPeriod = params.pregPeriod.getValue();
    shouldReproduceAsex = false;
    pregnant = true;
}

@Override
public boolean tick() {

    boolean alive = true;

    double energy = getEnergy();

    // Step energy update
    changeEnergy(-params.stepEnergy.getValue(), new StepCause());

    // if agent ages...
    if (params.agingMode)
        energy -= energyPenalty();

    // if agent energy is negative, die.
    if (energy <= 0)
        alive = false;

    if (!alive)
        die();

    LocationDirection location = null;

    if (alive)
        location = controller.chooseStep();

    if (alive && location != null) {
        if (canStep(location.location)) {
            move(location);
        } else if (environment.hasDrop(location.location)) {
            environment.getDrop(location.location).interact(this);
        } else if (environment.hasAgent(location.location)) {
            ComplexAgent adj = (ComplexAgent) environment.getAgent(location.location);

            // Is agent hungry?
            if (params.foodweb.canEatAgent[adj.getType()] && !adj.equals(this)) {
                eat(adj);
            }
        }
    }

    if (alive) {
        if (pregnant) {
            pregPeriod--;
            if (pregPeriod <= 0) {
                // Give birth
                ComplexAgent child;
                if (shouldReproduceAsex)
                    child = createChildAsexual(location);
                else
                    child = createChildSexual(location, breedPartner);
                breedPartner = null;
                pregnant = false;
            }
        } else if (params.foodweb.breedByEating
            && canEat(location.location)
            && enoughEnergy(params.breedEnergy.getValue())) {
            reproduceSexually(location, this);
        } else if (canBroadcast()) {
            broadcast(new FoodBroadcast(this, getPosition()), new BroadcastFoodCause());
        }

        receiveBroadcast();
    }

    return alive;
}

private void setCommInbox(double value) {
    this.commInbox = value;
}

private void setCommOutbox(double value) {
    this.commOutbox = value;
}

private void setMemoryBuffer(double value) {
    this.memoryBuffer = value;
}

private boolean enoughEnergy(double energy) {
    return getEnergy() > energy;
}

private void setParams(ComplexAgentParams agentData) {
    this.params = agentData;
    badAgentMemory = new CircularFifoQueue<>(params.memorySize);
}

public ComplexAgentParams getParams() {
    return params;
}
}
