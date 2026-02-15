const { Core, Events, Cache } = Global;
const { $fetch, $replaceContent, $toggleDisplay } = Global.Utils;


customElements.define('free-shipping-progress-bar', class extends Core {
    propTypes = {
        'cart-amount': Number,
        'free-shipping-amount': Number,
        'hide-on-complete': Boolean
    }

    elements = {
        $: [
            'progress',
            'msg-eligible',
            'msg-shortage'
        ],
    }

    render() {
        this.rate = Shopify.currency.rate || 1;
        this.total = this.prop('cart-amount'); 
        this.threshold = this.prop('free-shipping-amount') * this.rate;
        this.diff = this.threshold - this.total;
        this.freeShipping = this.diff <= 0;
    }

    set freeShipping(isFree) {
        $toggleDisplay(this.$('msg-eligible'), isFree);
        $toggleDisplay(this.$('msg-shortage'), !isFree);

        if(this.prop('hide-on-complete')) {
            $toggleDisplay(this.$('progress'), !isFree);
        }

        this.$('progress').style.setProperty('--progress', Math.min(this.progress, 100));

        if(!isFree) {
            this.$remainingValue = this.$('msg-shortage').querySelector('[data-i18n-amount]');
            this.$remainingValue.innerHTML = Shopify.formatMoney(this.diff);
        }
    }

    get progress() {
        return Math.round(this.total * 100 / this.threshold);
    }
})