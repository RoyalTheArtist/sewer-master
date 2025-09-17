export class Toolbar {
    toolbar: HTMLElement
    constructor(target: HTMLElement) {
        const toolbar = document.createElement('div')
        toolbar.classList.add('toolbar')

        target.prepend(toolbar);

        this.toolbar = toolbar
    }

    public addAction(name: string, action: () => void) {
        const button = document.createElement('button')
        button.innerText = name
        button.addEventListener('click', action)
        this.toolbar.appendChild(button)
        return this
    }
}