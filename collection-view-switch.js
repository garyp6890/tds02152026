const { Core, Events, Store } = Global;

const STORE_KEY = 'collection-horizontal-view';

customElements.define('collection-view-switch', class extends Core {
    elements = {
        $: ['switch-list', 'switch-grid']
    }

    render () {
        this.$('switch-list', {
            change: this._handleViewSwitchChange
        });

        this.$('switch-grid', {
            change: this._handleViewSwitchChange
        });

        this._init();
    }

    _init() {
        this.isHorizontalView
            ? this.$('switch-list').checked = true
            : this.$('switch-grid').checked = true;

        this.pub(Events.COLLECTION_VIEW_CHANGE, {
            horizontalViewState: this.isHorizontalView,
            first: true 
        });
    }

    _handleViewSwitchChange({ target }) {
        const horizontalViewState = target === this.$('switch-list');
        Store.set(STORE_KEY, horizontalViewState ? 1 : 0);
        
        this.pub(Events.COLLECTION_VIEW_CHANGE, { horizontalViewState })
    }

    get isHorizontalView() {
        return Boolean(Store.get(STORE_KEY));
    }
});