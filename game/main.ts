import { BoneTorch } from "./app"

function main() {
    const game = new BoneTorch()

    game.start()
}

window.onload = () => {
  main()
}