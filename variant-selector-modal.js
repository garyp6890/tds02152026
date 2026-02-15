const { Core, Events, DOMEvents, Utils } = Global;
const { $state } = Utils;

customElements.define('variant-selector-modal', class extends Core {
    elements = {};

    propTypes = {
        'product-id': Number,
        'product-url': String,
    };

    render() {
        this.$({ change: this._publishChange });
    }

    _publishChange(e) {
        e.stopPropagation();
        e.preventDefault();
        this.pub(Events.PRODUCT_BUNDLE_VARIANT_CHANGE, { 
            productId: this.prop('product-id'), 
            productURL: this.prop('product-url'), 
            variantId: e.target.value,
        });
        $state(this, 'disabled', true);
        // this.dispatchEvent(DOMEvents.MODAL_CLOSE);
    }

})