const { Core, Utils } = Global;
const { $state } = Utils;

function isPositiveInteger(value)   {
    return Number.isInteger(value) && value > 0;
}

customElements.define('product-qty-input', class extends Core {
    elements = {
        $: ['button-minus', 'button-plus', 'input']
    }

    currentValue = 1;

    render() {
        this.$('button-plus', { click: this._changeBy(1) });
        this.$('button-minus', { click: this._changeBy(-1) });
        this.$('input', { change: this._handleChange });
        this._toggleButtons();
    }

    _changeBy(value) {
        return () => {
            this.currentValue += value;
            this._applyCurrentValue();
        }
    }

    _handleChange({ target }) {
        const value = target.valueAsNumber;
        if (this.qtyLimit && value > this.qtyLimit) {
            this.currentValue = this.qtyLimit;
        } else if (!isPositiveInteger(value)) {
            this.currentValue = 1;
        } else {
            this.currentValue = value;
        }
        this._applyCurrentValue();
    }

    _applyCurrentValue() {
        this.$('input').value = this.currentValue;
        this._toggleButtons();
    }
    
    _toggleButtons() {       
        this.$('button-minus').toggleAttribute('disabled', this.currentValue === 1);
        this.$('button-plus').toggleAttribute('disabled', this.currentValue === this.qtyLimit);
    }

    get qtyLimit() {
        return +this.$('input').getAttribute('max');
    }
})