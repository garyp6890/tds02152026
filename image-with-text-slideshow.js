const { Core, onBlazeLoad } = Global;

customElements.define('image-with-text-slideshow', class extends Core {
    elements = {
        $: [['background-toggler']],
        slideshow: 'slideshow-blaze'
    }

    render() {
        if (!this.$('slideshow')) {
            return;
        }
        onBlazeLoad(this._loadSlider.bind(this));
    }

    async _loadSlider() {
        await customElements.whenDefined('slideshow-blaze');
        this.$('slideshow').slider.onSlide(this._updateCurrentBg.bind(this))
    }

    _updateCurrentBg(index) {
        this.$('background-toggler').at(index).checked = true;
    }
})