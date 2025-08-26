import '@/style.scss'

import { Engine } from '@engine/engine'
import { MainMenuScreen } from '@/screens/mainMenu/mainMenu.screen'
import { App } from '../bt-engine/app.base'
import { useGraphicsRenderSystem } from '@engine/render/system';

const RENDER_CONFIG = {
    type: "graphics",
    elem: "app",
    resolution: {
        width: 800,
        height: 600
    }
} as const

export class BoneTorch extends App {

    public start() {
        const renderSystem = useGraphicsRenderSystem(RENDER_CONFIG)
        const engine = new Engine(renderSystem)
        engine.setNextScreen(new MainMenuScreen())
        engine.start()
    }
}
