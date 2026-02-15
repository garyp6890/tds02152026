const { Core, Events, Utils } = Global;
const { $show } = Utils;

customElements.define('product-recommendations', class extends Core {
    render() {
        this.sub(Events.RECOMMENDATIONS_LOADED, this._handleRecommendationsLoad, { once: true });
    }
    
    _handleRecommendationsLoad(data) {
        if (data?.error) {
            return;
        }
        $show(this);
    }
});