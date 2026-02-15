const { Core, Events } = Global;

const CN_LOADING = '!loading';
const ATTR_VARIANT_ID = 'variant-id';

customElements.define('product-to-cart', class extends Core {
    elements = {
        $: ['to-cart-button']
    }

    propTypes = {
        'form-child': Boolean
    }

    render() {
        this.$({click: this._onClick});
        this.sub(Events.CART_UPDATE, this._cartUpdateHandler, { global: true });
        this.sub(Events.CART_ERROR, this._cartUpdateHandler, { global: true });
    }

    _onClick(e) {
        !this.prop('form-child') && e.preventDefault();
        this.loading = true;
        !this.prop('form-child') && this.addToCart(this.cartItem);
    }

    addToCart(items) {
        this.pub(Events.CART_ADD, {
            items
        });
    }

    _cartUpdateHandler() {
        setTimeout(() => {
            this.loading = false
        }, 1500)
    }

    get cartItem() {
        return [{ 
            id: this.variantId,
            quantity: 1
        }]
    }
    
    set loading(state) {
        this.$('to-cart-button').classList.toggle(CN_LOADING, state);
    }

    set variantId(id) {
        this.setAttribute(ATTR_VARIANT_ID, id)
    }

    get variantId() {
        return +this.getAttribute(ATTR_VARIANT_ID)
    }
})