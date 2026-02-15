const { Core, Utils, Events } = Global;
const { $active } = Utils;

customElements.define('cart-notification-recommendations', class extends Core {
    render() {
        this.sub(Events.RECOMMENDATIONS_LOADED, this._handleRecommendationsLoad, { once: true });
    }

    _handleRecommendationsLoad(res) {
        if(!res?.error) {
            $active(this);
        }
    }
})