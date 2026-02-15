const { Core, Events, Utils, Store } = Global;
const { $active, $toggleDisplay, $isHidden } = Utils;
const STORE_KEY = 'productsCompare';

customElements.define('products-comparison-checkbox', class extends Core {
    propTypes = {
        'product-url': String,
        'image-url': String
    }
    
    elements = {
        $: ['input']
    }
    
    inited = false;

    render() {
        this.sub(Events.PRODUCT_COMPARE_UPDATE, this._onUpdate, {global:  true});
        this.$({ change: this._onChange });
        !this.inited && this._requestUpdate();
    }
    
    _requestUpdate() {
        this.pub(Events.PRODUCT_COMPARE_UPDATE_REQUEST);
    }

    _onUpdate({ comparingProductURLs, limitReached }) {
        $isHidden(this) && $toggleDisplay(this, true);
        this.selected = comparingProductURLs.includes(this.prop('product-url'));
        this.disabled = !this.selected && limitReached;
        this.inited = true;
    }

    _onChange({ target }) {
        this.disabled = true;
        this.pub(Events.PRODUCT_COMPARE_CHANGE, {
            url: this.prop('product-url'), 
            state: target.checked,
            onError: () => { this.selected = !this.selected },
            after: () => { this.disabled = false }
        });
    }

    set disabled(state) {
        this.$('input').disabled = state;
    }

    set selected(state) {
        this.$('input').checked = state;
    }

    get selected() {
        return this.$('input').checked;
    }
})