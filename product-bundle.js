const { Core, Events, DOMEvents } = Global;
const { $fetch, $replaceContent, $toggleDisplay } = Global.Utils;

const R_PRODUC_CARD_SECTION = "r_product-bundle-card";
const SEL_BUNDLE_CARD = "#product-bundle-card";
const SEL_BUNDLE_CARD_TEMPLATE = "[data-card-template]";

function _getPriceValue(el) {
    return Number(el.dataset.priceValue);
}

customElements.define('product-bundle', class extends Core {
    propTypes = {
        'product-url': String,
        'initial-variant': String,
        'subtotal': Number,
        'selected-count': Number
    }

    elements = {
        $: [['product-bundle-item'], 'subtotal', 'main-product', 'main-product-meta', 'footer'],
        'button-counter': '[data-i18n-amount]'
    }



    render() {
        this._initValues();

        this.sub(Events.PRODUCT_BUNDLE_VARIANT_CHANGE, this._handleVariantChange, { global: true });
        this.$('product-bundle-item', {
            change: this._handleChange
        });

        this.$('main-product', {
            update: this._handleMainProductUpdate
        });
    }

    _initValues() {
        this.mainPrice = _getPriceValue(this.$('main-product-meta'));
        this.subtotal = this.prop('subtotal');
        this.selectedCount = this.prop('selected-count');
    }

    _handleMainProductUpdate() {
        const productMeta = this.$('main-product-meta');

        // Don't like the idea of relying on implicit re-render of main-product-meta, but right now it's the cheapest option
        $toggleDisplay(this, productMeta.dataset.available);
        
        const updatedMainPrice = _getPriceValue(productMeta);
        if(this.mainPrice === updatedMainPrice) {
            return;
        }
        this.subtotal = this.subtotal - this.mainPrice + updatedMainPrice;
        this.mainPrice = updatedMainPrice;
        this._renderSubtotal();
    }

    _handleChange(e) {
        try { 
            if(e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
                this._handleCheckboxChange(e);
                return;
            };
            throw new Error('invalid change event');
        } catch(e) {
            console.error(e);
        }
    }
    _handleCheckboxChange(e) {
        const checkbox = e.target;
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
        this._renderFooter();
        this._updateButtonCount();
    }

    async _handleVariantChange(data) {
        const $currentCard = this.$('product-bundle-item').find(item => +item.dataset.productId === data.productId);
        this._setChecked($currentCard, false);
        const cardContent = await this._fetchCard(data.productURL, data.variantId);
        $replaceContent($currentCard, cardContent);
        this._setChecked($currentCard, true);
    }

    _setChecked($card, state) {
        const $checkbox = $card.querySelector(`[data-item-checkbox]`);
        if(!state && $checkbox.checked || state && !$checkbox.checked) {
            $checkbox.checked = state;
            $checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            return
        }
    }

    async _fetchCard(productURL, variantId) {
        try {
            return await $fetch(productURL, {
                params: {
                    variant: variantId,
                    section_id: R_PRODUC_CARD_SECTION
                },
                select: SEL_BUNDLE_CARD_TEMPLATE
            });
        } catch(err) {
            console.error(err);
        }
    }

    _renderFooter() {
        $toggleDisplay(this.$('footer'), this.selectedCount > 0);
    }

    _updateButtonCount() {
        // count with the main product
        this.$('button-counter').innerText = this.selectedCount + 1;
    }

    _renderSubtotal() {
        const renderValue = Shopify.formatMoney(this.subtotal);
        this.$('subtotal').innerHTML = renderValue;
    }

})