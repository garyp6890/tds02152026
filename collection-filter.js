const { Core, Events } = Global;
const EVENT_SRC = 'filter';

customElements.define('collection-filter-list', class extends Core {
    propTypes = {
        'form-id': String
    }

    render() {
        this.$({ change: this._changeHandler });
        this.sub(Events.COLLECTION_UPDATED, this._handleCollectionUpdate);
    }
    
    _changeHandler(e) {
        this.pub(Events.COLLECTION_CHANGE, { 
            src: EVENT_SRC, 
            formId: this.prop('form-id')
        });
    }        

    _handleCollectionUpdate({ doc, src }) {
        if(src === EVENT_SRC) {
            this.updateContentFrom(doc);
        }
    }
})