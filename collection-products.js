const { Core, Events, Utils } = Global;
const { $replaceContent, $state } = Utils;

const HORIZONTAL_VIEW_CN = '@list';
const INIT_CN = 'init';

customElements.define('collection-products', class extends Core {
    elements = {
        $: ['products-container']
    }

    propTypes = {
        'user-switchable': Boolean
    }
    
    render() {
        this.sub(Events.COLLECTION_UPDATED, this._handleCollectionUpdate);
        this.prop('user-switchable') && this.sub(Events.COLLECTION_VIEW_CHANGE, this._toggleHorizontalView, { global: true });
    }

    _handleCollectionUpdate({ doc, src }) {
        if(src !== 'dynamic-pagination') {
            this.updateContentFrom(doc);
            return;
        }

        const additionalProducts = 
            doc.getElementById(this.id)
                .querySelector(this.elements['products-container'])
                .childNodes;

        this.$('products-container')
            .append(...additionalProducts);
    }

    _toggleHorizontalView({ horizontalViewState, first }) {
        this.classList.toggle(HORIZONTAL_VIEW_CN, horizontalViewState);
        first && $state(this, INIT_CN, false);
    }
})