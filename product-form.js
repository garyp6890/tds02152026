const { Core, Events, Utils } = Global;
const { $state } = Utils;
const PREFIX_BUY_WITH = 'buy_with_' 

customElements.define('product-form', class extends Core {
    propTypes = {
        'multiple-products': Boolean
    }

    elements = {
        toCartButton: 'product-to-cart',
        form: '[data-type=add-to-cart-form]'
    }

    render() {
        this.$('form', {
            submit: this._submitHandler
        });
    }

    _submitHandler(e) {
        e.preventDefault();
        this._validateForm();
        this.prop('multiple-products')
            ? this.$('toCartButton').addToCart(this.cartItems)
            : this.pub(Events.PRODUCT_FORM_SUBMIT, {
                formData: this.formData
              });

    }
    // To prevent send empty form fields
    _validateForm() {
        this.formData = this._getFormData();

        for (const [key, value] of [...this.formData.entries()]) {
            if (value.trim() === "") this.formData.delete(key);
        }
    }

    _isVariantInput([ inputName ]) {
        return inputName.includes(PREFIX_BUY_WITH) || inputName === 'id';
    }

    _setCartItem([ _, value ]) {
        return {
            id: value,
            quantity: 1
        }
    }

    _getFormData() {
        return new FormData(this.$('form'));
    }

    get cartItems() {
        return Array.from(this.formData.entries())
            .filter(this._isVariantInput.bind(this))
            .map(this._setCartItem.bind(this))
    }
})