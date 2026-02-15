const { Core, Store, Events, DOMEvents } = Global;

function _isPositionEqual(position) {
    return (element) => {
        return element.dataset.position === position;
    }
}

customElements.define('product-quick-view', class extends Core {

    elements = {
        $: [['media']],
        slider: 'slideshow-blaze'
    }

    render() {
        this.sub(Events.CART_UPDATE, this._closeModal, { global: true });
        this.sub(Events.VARIANT_UPDATE, this._handleVariantUpdate)
    }

    _closeModal() {
        this.dispatchEvent(DOMEvents.MODAL_CLOSE);
    }

    _handleVariantUpdate({ imagePosition }) {
        if(!imagePosition || !this.$('slider')) {
            return;
        }
        const index = this.$('media').findIndex(_isPositionEqual(imagePosition));
        if(index >= 0) {
            this.$('slider').slideTo(index);
            // NOTE: setting new initial index to keep slider state if it will reopen
            this.$('slider').setProp('initial-index', index);
        }
    }
})
