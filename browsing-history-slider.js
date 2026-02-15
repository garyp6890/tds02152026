const { Core, Utils, Events } = Global;
const { $show, $hide } = Utils;

customElements.define('browsing-history-slider', class extends Core {
    elements = {
        slider: 'slideshow-inline-blaze'
    }

    render() {
        this.sub(Events.BROWSING_HISTORY_LOAD, this._handleHistoryLoad, { once: true });
    }

    _handleHistoryLoad({ items, error }) {
        if(error || !items || items.length === 0) {
            $hide(this);
            return;
        }
        
        this.items = items;
        customElements.whenDefined(this.elements.slider)
            .then(this._updateSlider.bind(this))
    }

    _updateSlider() {
        $show(this);
        this.$('slider').replaceSlides(this.items);
    }
})