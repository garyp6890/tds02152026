const { Core, Events, onBlazeLoad } = Global;

customElements.define('product-gallery-slider', class extends Core {
    propTypes = {
        'listen-variants': Boolean
    }
    
    elements = {
        slider: 'slideshow-blaze'
    }

    render() {
        if (this.prop('listen-variants')) {
            this.sub(Events.VARIANT_UPDATE, this._onVariantChange);
        }
        this.sub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, this._changeSlide);
        onBlazeLoad(this._handleSlider.bind(this));
    }

    _onVariantChange({ imageIndex }) {
        if(imageIndex >= 0) {
            this.pub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, imageIndex);
            this._changeSlide(imageIndex);
        }
    }

    async _handleSlider() {
        await customElements.whenDefined(this.elements.slider);
        this.$('slider').slider.onSlide(this._handleSlideChange.bind(this))
    }

    _handleSlideChange(index) {
        this.pub(Events.PRODUCT_GALLERY_SLIDE_CHANGE, index);
    }

    _changeSlide(index) {
        this.$('slider')?.slideTo(index);
    }
});