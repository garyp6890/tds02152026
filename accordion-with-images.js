const { Core, Utils } = Global;
const { $active } = Utils;

const CN_ACTIVE = '!active';

customElements.define('accordion-with-images', class extends Core {
    elements = {
        $: [['thumbnail']]
    }

    render() {
        const [ firstThumbnail ] = this.$('thumbnail', {
            click: this._handleThumbnailClick
        })

        this._setActiveThumbnail(firstThumbnail)
    }

    _handleThumbnailClick({ currentTarget }) {
        this._setActiveThumbnail(currentTarget);
    }

    _setActiveThumbnail(current) {
        if(current === this.activeItem) return;
        this.activeItem && $active(this.activeItem, false);
        this.activeItem = current;
        $active(this.activeItem);
    }
})