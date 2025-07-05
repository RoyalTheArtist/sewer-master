export class EventSystem {
    public static events: Map<string, Function[]> = new Map<string, Function[]>();

    public static on(event: string, callback: Function) {
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event)?.push(callback);
    }

    public static emit(event: string, ...args: any[]) {
        if (!this.events.has(event)) return;
        this.events.get(event)?.forEach((callback) => callback(...args));
    }
}