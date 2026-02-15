const { Core, Events, Utils, Store } = Global;
const { $toggleDisplay } = Utils;

const COMPARING_URLS_STORE_KEY = 'compare';

customElements.define('products-comparison-trigger', class extends Core {
    propTypes = {
        'show-counter': Boolean,
        'notification-msg': String,
        'notification-title': String
    }
    
    elements = {
        $: ['compare-count'],
    }
    
    render() {
        this.$({'click': this._onClick})
        if (this.prop('show-counter')) {
            this._updateCounterValue();
            this.sub(Events.PRODUCT_COMPARE_UPDATE, this._updateCounterValue, {global: true});
        }
    }

    _onClick() {
        if (this.comparingCount > 1) {
            this.pub(Events.PRODUCT_COMPARE_OPEN);
            return
        }
        this.pub(Events.TOAST_NOTIFICATION, {
            msg: this.prop('notification-msg'),
            title: this.prop('notification-title')
        });
    }

    _updateCounterValue() {
        this.$('compare-count').innerText = this.comparingCount;
        $toggleDisplay(this.$('compare-count'), this.comparingCount > 0)
    }

    get comparingCount() {
        return Store.get(COMPARING_URLS_STORE_KEY).length;
    }
})