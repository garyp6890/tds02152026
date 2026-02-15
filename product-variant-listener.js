const { Core, Events } = Global;
const { $isEmpty, $replaceContent } = Global.Utils;

customElements.define('product-variant-listener', class extends Core {
    propTypes = {
        emptyable: Boolean,
        'variant-selector': Boolean
    }
    isMetaHidden = false;
    render() {
        // TEMP: emptyable -> bad naming
        if(this.prop('emptyable')) {
            this.$meta = this.closest('[data-meta-block]');
            this._setMetaHidden();
        }

        this.sub(Events.VARIANT_UPDATE, this._onVariantUpdate);
    }
    
    _onVariantUpdate({ targets }) {
        try {
            $replaceContent(this, targets[this.id], true)
            if(this.prop('emptyable') || this.isMetaHidden) {
                this._setMetaHidden();
            }
            this.dispatchEvent(new CustomEvent('update', {
                bubbles: true
            }))
        } catch (error) {
            console.log(`Can't find ${targets[this.id]} in update `);
        }
    }

    _setMetaHidden(state) {
        this.isMetaHidden = state === undefined ? $isEmpty(this) : state;
        this.$meta.toggleAttribute('hidden', this.isMetaHidden);
    }
})


customElements.define('product-variant-selector', class extends Core {
    render() {
        this.$({'change': this._onVariantChange});
    }
    
    _onVariantChange(e) {
        this.pub(Events.VARIANT_CHANGE, {
            optionValueId: e.target.dataset.optionValueId, 
            optionIndex: e.target.dataset.optionIndex,
            variantId: e.target.dataset.variantId,
            imagePosition: e.target.dataset.imagePosition
        });
    }
})