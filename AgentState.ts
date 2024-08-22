// Import the ParameterSerializable interface from its module
import { ParameterSerializable } from './ParameterSerializable';// module location incorrect

// Define the AgentState interface, extending ParameterSerializable
export interface AgentState extends ParameterSerializable {
    isTransient(): boolean;
}