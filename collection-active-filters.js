const { Core, Events } = Global;
const EVENT_SRC = 'filter';

customElements.define('collection-active-filters', class extends Core {
    
    render() {
        this.sub(Events.COLLECTION_UPDATED, this._handleCollectionUpdate);
        this.$({ change: this._handleChange });
    }

    _handleChange(e) {
        this.pub(Events.COLLECTION_CHANGE, {
            src: EVENT_SRC,
            url: e.target.value
        })
    }

    _handleCollectionUpdate({ src, doc }) {
        if(src === EVENT_SRC || src === 'sort') {
            this.updateContentFrom(doc);
        }
    }
})
