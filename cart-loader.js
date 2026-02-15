const { Core, Utils, Events } = Global;
const { $loading } = Utils;

customElements.define('cart-loader', class extends Core { 

    render() {
        this.sub(Events.CART_CHANGE, this._handleCartChange, { global: true });
        this.sub(Events.CART_REPLACE, this._handleCartChange, { global: true });
        this.sub(Events.CART_ERROR, this._handleCartError, { global: true });
    }

    _handleCartChange({ key }) {
        this.updatingProduct = this.querySelector(`[data-item-key="${key}"]`);
        if(!this.updatingProduct) {
            return;
        }

        $loading(this.updatingProduct);
    }

    _handleCartError() {
        this.updatingProduct && $loading(this.updatingProduct, false);
    }
})