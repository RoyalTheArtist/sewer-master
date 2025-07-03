import '@/style.scss'

import { ViewportSimple as Viewport } from '@engine/render'
import { Engine } from '@engine/engine'
import { MainMenuScreen } from './screens'
import { AssetManager } from '@engine/assets';
import { App } from './app.base'
import { Vector2D } from '@engine/utils';
import { SurfaceLayers } from '@engine/render/surfaceLayers';


//TileSetManager.buildManifest('sewers',sewerTileset)
//AssetManager.baseUrl = 'src/apps/sewerMaster/'
AssetManager.loadSpritesheet('data/sewers.sprites.json')
AssetManager.loadSpritesheetManifest('data/spritesheets.json')


export class BoneTorch extends App {

    public start() {
        //const surface = makeSurface(800, 600)
        const resolution = new Vector2D(800, 600)
        const viewport = new Viewport(resolution, new SurfaceLayers(resolution))
        viewport.initialize('app')
        const engine = new Engine(viewport)
        engine.setScreen(new MainMenuScreen())
        engine.start()
    }
}
