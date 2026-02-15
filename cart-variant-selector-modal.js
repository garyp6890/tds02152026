const { Core, Events, DOMEvents, Utils } = Global;
const { $state } = Utils;

customElements.define('cart-variant-selector-modal', class extends Core {
    elements = {
        modal: 'modal-container'
    }

    propTypes = {
        'old-key': String,
        'old-line-index': Number,
        'quantity': Number
    };

    render() {
        this.$({ change: this._publishChange });
        this.$('modal', {'modal-close': this._handleClose } );
    }

    _publishChange(e) {
        e.stopPropagation();
        e.preventDefault();
        this.pub(Events.CART_REPLACE, { 
            key: this.prop('old-key'), 
            newItem: e.target.value,
            quantity: e.target.dataset.quantity,
            line: this.prop('old-line-index')
        });
        this.$('modal').close();
    }
    
    _handleClose(e) {
        e.stopPropagation();
    }
})