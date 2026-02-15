const { Core } = Global;


customElements.define('moving-content', class extends Core {

    elements = {
        $: ['content']
    }

    render() {
        this.contentWidth = this.$('content').offsetWidth;
        //sanity check
        if (!this.contentWidth) {
            this.remove();
            return;
        }
        this._setContent();
        this.style.setProperty('--content-width', `${this.contentWidth}`);
    }

    _setContent() {
        const items = [...Array(this.duplicates)].map(this._cloneContent.bind(this));
        this.replaceChildren(...items);
    }

    _cloneContent() {
        return this.$('content').cloneNode(true);
    }

    get duplicates() {
        return Math.ceil(window.innerWidth / this.contentWidth) + 1;
    }
})