import { Item } from '@modules/items';
import { Component } from '@engine/ecs';
export class Inventory extends Component {
    private _items: Array<Item> = []
    constructor(public size: number) { super() }

    public get items() {
        return this._items
    }

    public addItem(item: Item) {
        this._items.push(item)
    }

    public removeItem(item: Item) {
        this._items.splice(this._items.indexOf(item), 1)
    }

    public initialize() {}
    public update() {}
}