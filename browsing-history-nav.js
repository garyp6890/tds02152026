const { Core, Utils, Events } = Global;
const { $state } = Utils;

customElements.define('browsing-history-nav', class extends Core {
    elements = {
        $: ['content']
    }

    render() {
        this.sub(Events.BROWSING_HISTORY_LOAD, this._handleHistoryLoad, { once: true });
    }

    _handleHistoryLoad({ items, error }) {
        if(error || !items || items.length === 0) {
            $state(this, 'empty', true)
            return;
        }
        this._updateCards(items);
    }

    _updateCards(items) {
        items.forEach(element => {
            this.$('content').append(Utils.$clone(element));
        });
    }
})