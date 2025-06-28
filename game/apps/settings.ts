import { Vector2D } from "@engine/utils";

export const Settings = Object.freeze({
    map: {
        size: new Vector2D(10, 10)
    },
    tiles: {
        size: new Vector2D(16, 16)
    },
    keyboardMappings: {
        gameScreen: {
            w: ['move_up', 'inventory_scroll_up'],
            s: ['move_down', 'inventory_scroll_down'],
            a: ['move_left', 'inventory_scroll_left'],
            d: ['move_right', 'inventory_scroll_right'],
            q: ['move_up_left', 'inventory_scroll_up_left'],
            e: ['move_up_right', 'inventory_scroll_up_right'],
            z: ['move_down_left', 'inventory_scroll_down_left'],
            c: ['move_down_right', 'inventory_scroll_down_right'],
            i: ['open_inventory'],
            p: ['pickup_item']
        },
        mainMenu: {
            n: ['new_game'],
            t: ['test_chamber'],
            q: ['quit']
        }
    }
})