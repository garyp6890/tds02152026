const { Core, Events, Cache } = Global;
const { $fetch, $replaceContent, $toggleDisplay, $clone, $state } = Global.Utils;

const CACHE_KEY = 'complementary-products';

function _getPriceValue(el) {
    return Number(el.dataset.priceValue);
}

function _cacheKey(variantId) {
    return `${CACHE_KEY}-${variantId}`;
}

customElements.define('complementary-products', class extends Core {
    propTypes = {
        'product-url': String,
        'subtotal': Number,
        'selected-count': Number,
        'initial-variant': String
    }

    elements = {
        $: ['subtotal'],
        'button-counter': '[data-i18n-amount]'
    }

    render() {
        this._initValues();
        this._initCache();
        this.sub(Events.VARIANT_CHANGE, this._onVariantUpdate, { global: true });
        this.$({
            change: this._handleChange
        });
    }

    _initValues() {
        this.subtotal = this.prop('subtotal');
    }

    _initCache() {
        Cache.set(_cacheKey(this.prop('initial-variant')), $clone(this));
    }

    // might be a good idea to implement it in base API
    set selectedCount(value) {
        this.$('button-counter').innerText = value;
        this.setProp('selected-count', value);
    }
    get selectedCount() {
        return this.prop('selected-count');
    }

    // It's simpler just to re-render whole thing
    async _onVariantUpdate({ variantId }) {
        const $self = await this._getFromCache(variantId);
        this.$section.append($self);
        this.remove();
    }

    async _getFromCache(variantId) {
        if(!Cache.has(_cacheKey(variantId))) {
            const $content = await $fetch(this.prop('product-url'), {
                select: `#${this.id}`,
                params: {
                    variant: variantId,
                    section_id: this.sectionId
                }
            }); 
            Cache.set(_cacheKey(variantId), $content);
        }

        return $clone(Cache.get(_cacheKey(variantId)));
    }

    _handleChange(e) {
        const checkbox = e.target;
        try {
            if(checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox') {
                throw new Error('invalid change event');
            }
            const price = _getPriceValue(checkbox);
            if(isNaN(price)) {
                throw new Error('invalid price');
            }
            if(checkbox.checked) {
                this.subtotal += price;
                this.selectedCount++;
            } else {
                this.subtotal -= price;
                this.selectedCount--;
            }
            this._renderSubtotal();
        } catch(e) {
            console.error(e);
        }
    }

    _renderSubtotal() {
        this.$('subtotal').innerHTML = Shopify.formatMoney(this.subtotal);
    }
})