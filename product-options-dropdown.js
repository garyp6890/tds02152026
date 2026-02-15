const { Core } = Global;

customElements.define('product-options-dropdown', class extends Core {
    elements = {
        dropdown: 'drop-down',
        $: ['current']
    }

    render() {
        this._handleChange();
    }

    _handleChange() {
        this.$({'change': this._onChange});
    }

    _onChange({ target }) {
        if(this.$('current')) {
            this.$('current').textContent = target.value;
        }
        this.$('dropdown').close();
    }
});