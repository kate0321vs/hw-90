interface Positions {
    x: number;
    y: number;
}

export interface IncomingPositions {
    type: string;
    payload: Positions;
}