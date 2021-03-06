export function sleep(ms: number): Promise<number> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export enum EventNames {
    Cleanup = "Cleanup",
    ScanBegin = "ScanBegin",
    ScanFinished = "ScanFinished",
    ScanButtonPressed = "ScanButtonPressed"
}