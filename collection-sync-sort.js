const { Core, Events } = Global;
customElements.define('collection-sync-sort', class extends Core {
    
    render() {
        this.sub(Events.COLLECTION_UPDATED, this._handleCollectionUpdate);
    }
    _handleCollectionUpdate({ src, doc }) {
        if(src === 'sort') {
            this.updateContentFrom(doc);
        }
    }
})