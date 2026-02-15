const { Core, Events } = Global;
    
const CN_ACTIVE = '!active';

customElements.define('product-info-loading', class extends Core {
    
    render() {
        this.sub(Events.VARIANT_LOADING, this._handleLoading);
    }
    
    _handleLoading(state) {
        this.classList.toggle(CN_ACTIVE, state);
    }
});