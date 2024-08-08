/**
 *
 */
export class ComplexEnvironmentParams {
    /**
     * Width of the grid.
     */
    public width: number = 80;

    /**
     * Height of the grid.
     */
    public height: number = 80;

    /**
     * Enables the grid to wrap around at the edges.
     */
    public wrapMap: boolean = true;

    /**
     * Number of stones to randomly place
     */
    public initialStones: number = 10;
}