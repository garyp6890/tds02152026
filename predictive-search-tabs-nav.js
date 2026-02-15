const { Core, Utils } = Global;
const { $active } = Utils;

customElements.define('predictive-search-tabs-nav', class extends Core {
    elements = {
        $: [['thumb']]
    }

    render() {
        const [ firstThumbnail ] = this.$('thumb', {
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
});