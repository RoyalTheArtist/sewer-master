import '@/style.scss'

import { Viewport, makeSurface } from '@engine/render'
import { Engine } from '@engine'
import { MainMenuScreen } from './screens'
import { AssetManager } from '@engine/assets';
import { App } from './app.base'


//TileSetManager.buildManifest('sewers',sewerTileset)
//AssetManager.baseUrl = 'src/apps/sewerMaster/'
AssetManager.loadSpritesheet('data/sewers.sprites.json')
AssetManager.loadSpritesheetManifest('data/spritesheets.json')


export class BoneTorch extends App {

    public start() {
        const surface = makeSurface(800, 600)
        const viewport = new Viewport(surface)
        viewport.initialize()
        const engine = new Engine(viewport)
        engine.setScreen(new MainMenuScreen())
        engine.start()
    }
}
