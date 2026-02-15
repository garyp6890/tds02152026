const { Core, onBlazeLoad } = Global;
customElements.define('text-thumbnails-slideshow', class extends Core {
    elements = {
        $: [['thumb']],
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
        this.$('slideshow').slider.onSlide(this._updateCurrentThumb.bind(this));
        this.$({
            change: this._handleChange
        });
    }

    _updateCurrentThumb(index) {
        this.$('thumb')[index].checked = true;
    }

    _handleChange({ target }) {
        this.$('slideshow').slider.stopAutoplay();
        this.$('slideshow').slideTo(+target.dataset.thumbIndex);
    }
})