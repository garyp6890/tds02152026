const { Core, Utils, Events } = Global;
const { $loading } = Utils;

customElements.define('cart-drawer', class extends Core { 
    elements = {
        'modal': 'modal-container'
    }

    render() {
        this.sub(Events.CART_UPDATE, this._handleAddingToCart, { global: true });
        this.sub(Events.CART_CHANGE, this._handleCartChange, { global: true });
        this.sub(Events.CART_REPLACE, this._handleCartChange, { global: true });
        this.sub(Events.CART_DRAWER_MUTE, this._handleMute, { once: true, global: true });
        this.sub(Events.CART_ERROR, this._handleCartError, { global: true });
    }

    _handleAddingToCart({ req }) {
        if(req === 'cartAdd') {
            this.$('modal').open();
        }
    }

    _handleCartChange({ key }) {
        this.updatingProduct = this.querySelector(`[data-item-key="${key}"]`);
        if(!this.updatingProduct) {
            return;
        }

        $loading(this.updatingProduct);
    }

    _handleMute() {
        this.unsub(Events.CART_UPDATE);
    }

    _handleCartError() {
        this.updatingProduct && $loading(this.updatingProduct, false);
    }
})