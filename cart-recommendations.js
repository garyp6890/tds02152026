const { Core, Events, Utils } = Global;
const { $toggleDisplay, $fetch, $replaceContent } = Utils;

customElements.define('cart-recommendations', class extends Core {
    propTypes = {
        'url': String
    }

    render() {
        this.sub(Events.RECOMMENDATIONS_LOADED, this._handleRecommendations);
    }

    _handleRecommendations(res) {
        $toggleDisplay(this, !res?.error);
    }
});