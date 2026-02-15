const { Core, Utils, Events } = Global;
const { $toggleDisplay, $state } = Utils;

customElements.define('product-dynamic-checkout', class extends Core {
    upsellProductsCount = 0;
    
    render() {
        this._rerenderPaymentButton();
        this.sub(Events.CART_ADD, this._disable, { global: true });
        this.sub(Events.PRODUCT_FORM_SUBMIT, this._disable, { global: true });
        this.sub(Events.CART_CHANGE, this._enable, { global: true });
        this.sub(Events.CART_UPDATE, this._enable, { global: true });
        this.sub(Events.CART_ERROR, this._enable, { global: true });
    }

    _rerenderPaymentButton() {
        if (window.Shopify?.PaymentButton?.init) {
            window.Shopify.PaymentButton.init();
        }
    };

    _disable() {
        this.disabled = true;
    }

    _enable() {
        setTimeout(() => {
            this.disabled = false
        }, 1500);
    };

    set disabled(state) {
        $state(this, 'disabled', state);
    };
});
