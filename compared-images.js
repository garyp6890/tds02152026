const { Core } = Global;

customElements.define('compared-images', class extends Core {
    elements = {
        $: ['range']
    }

    render() {
        this.$('range', {
            input: this._handleRange
        });
    }

    _handleRange({ target }) {
        this.style.setProperty('--separator-position', `${target.value}%`);
    }
});