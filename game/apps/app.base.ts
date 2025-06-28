import { IInitialize, IStart } from "@engine";

export abstract class App implements IInitialize, IStart { 
    initialize(): void {}
    start(): void {}
}