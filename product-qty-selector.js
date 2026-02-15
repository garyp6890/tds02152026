const { Core, Utils, Events } = Global;
const { $clone } = Utils;

const SEL_INPUT = '[data-element="input"]';

customElements.define('product-qty-selector', class extends Core {
    elements = {
        $: ['selector-wrapper', 'input-template']
    }

    render() {
        this.$('selector-wrapper', { change: this._onQtyChange })
    }
    _onQtyChange(e) {
        if (+e.target.value === 10) this._changeInputType();
    }
    async _changeInputType() {
        this.replaceChild($clone(this.$('input-template')), this.$('selector-wrapper'));
        await customElements.whenDefined('product-qty-input');
        const $input = this.querySelector(SEL_INPUT);
        $input.setAttribute('value', 10);
        const event = new Event('change');
        $input.dispatchEvent(event);
    }        
})