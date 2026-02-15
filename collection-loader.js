const { Core, Utils, Events } = Global;
const { $toggleDisplay } = Utils;

customElements.define('collection-loader', class extends Core {
    render() {
        this.sub(Events.COLLECTION_LOADING, this._collectionLoadingHandler);
    }

    _collectionLoadingHandler(state) {
        $toggleDisplay(this, state)
    }
});