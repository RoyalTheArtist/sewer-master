import { createAppearances, TilesetData } from '@modules/generators/temporary'
import { TinyQuest } from './tinyquest/app'
import { Resources } from '@engine/assets/loader'

function main() {
    
    const game = new TinyQuest()

    game.start()
}

window.onload = () => {
  main()
}