const { Core, Utils, Events } = Global;
const { $fetch, $replaceContent } = Utils;

customElements.define('compare-products', class extends Core {

    propTypes = {
        'product-url': String
    }
    
    render() {
        this.sub(Events.VARIANT_CHANGE, this._refresh, { global: true });
    }

    async _refresh({ variantId }) {
        const $doc = await this._fetchSection(variantId);
        $replaceContent(this, $doc);
    }

    _fetchSection(variantId) {
        return $fetch(this.prop('product-url'), {
            sectionId: this.sectionId,
            params: {
                variant: variantId
            },
            select: `[section-id="${this.sectionId}"]`
        });
    }
});