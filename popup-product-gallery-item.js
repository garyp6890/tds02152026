const { Core, Utils } = Global;
const { $show, $hide } = Utils;

customElements.define('popup-product-gallery-item', class extends Core {
    propTypes = {
        'initial-variant': String
    }

    elements = {
        $: ['variant-selector', ['variant-image']],
        toCartButton: 'product-to-cart'
    }
    
    render() {
        if (this.$('variant-image').size <= 1) {
            return
        }
        this.$('variant-selector', { change: this._onOptionChange });
    }

    _onOptionChange({ target }) {
        this._toggleCurrentImage(target.value);
        this.$('toCartButton').variantId = target.value;
    }

    _toggleCurrentImage(id) {
        !this.$currentVariantImage && this._setVariantImage(this.prop('initial-variant'));
        $hide(this.$currentVariantImage);
        this._setVariantImage(id);
        $show(this.$currentVariantImage);
    }

    _setVariantImage(id) {
        this.$currentVariantImage = this.$('variant-image').find(image => image.dataset.variant === id);
    }
})