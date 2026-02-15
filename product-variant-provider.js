const { Core, Events, Cache } = Global;
const { $fetch, $loading, $JSON } = Global.Utils;

const CACHE_KEY = 'variant-provider';

// TODO: Make it as global util -> nodeListToMap
function elementsToMap(elements) {
    return elements.reduce((acc, element) => {
        if (element.id) {
            acc[element.id] = element.cloneNode(true);
        }
        return acc;
    }, {});
}

class OptionsHistory {
    constructor(limit) {
        this.limit = limit;
        this.items = Array.from(Array(limit).keys());
    }
    add(item) {
        if(this.lastItem === item) {
            return;
        }
   
        const index = this.items.indexOf(item);
        this.items.splice(index, 1);
        this.items.push(item);
        // sanity chech
        if (this.items.length > this.limit) {
            this.items.shift();
        }
    }
    get lastItem() {
        return this.items.at(-1);
    }

    getValidOption(options) {
        for (const optionIndex of this.items) {
            // If matching option index comes from the last item, it means selection 
            // from other(previous) options failed to find it, hence the next selection 
            // will not include a variant with the last item option id
            if(options[optionIndex] && this.lastItem !== optionIndex) {
                return {
                    ...options[optionIndex],
                    optionIndex
                }
            }
        }
        return null;
    }
}

customElements.define('product-variant-provider', class extends Core {
    propTypes = {
        'product-page': Boolean,
        'product-url': String,
        'initial-variant-id': String,
        'initial-image-position': Number,
        'initial-selling-plan': String,
        'allow-unavailable-variants': Boolean,
        'no-cache': Boolean,
        'initial-options-state': String
    }

    elements = {
        $: ['product-meta'],
        listeners: ['product-variant-listener']
    }
    
    render() {
        this.smartSelect = !this.prop('allow-unavailable-variants');
        this.sub(Events.VARIANT_CHANGE, this._changeVariant);
        this.sub(Events.SELLING_PLAN_CHANGE, this._onSellingPlanChange)
        this._initState();
    }

    async _initState() {
        this.currentState = { 
            variantId: this.prop('initial-variant-id'),
            optionValueIds: this.prop('initial-options-state').split(','),
            variantImagePosition: this.prop('initial-image-position'),
            sellingPlanId: this.prop('initial-selling-plan')
        };
        if (this.smartSelect) {
            this.optionsHistory = new OptionsHistory(this.currentState.optionValueIds.length);
        }
        this._initCache();
    }

    _initCache() {
        if(this.prop('no-cache')) {
            return;
        }
        if (!Cache.has(this.cacheKey)) {
            Cache.set(this.cacheKey, {
                listeners: elementsToMap(this.$('listeners'))
            });
            return;
        }
        // if we have cache on initilization it's mean this cache was initited by someone before
        // refresh contents on the next tick
        setTimeout(() => {
            this._publishUpdates();
        }, 20)
    }

    _changeVariant({ optionValueId, optionIndex, variantId, imagePosition }) {        
        this.currentState.optionValueIds[+optionIndex] = optionValueId;        
        this.currentState.variantId = variantId || undefined;
        this.currentState.variantImagePosition = imagePosition;

        if (this.smartSelect) {
            this.optionsHistory.add(+optionIndex);        
        }
        this._handleUpdate();
    }

    async _handleUpdate() {
        this.pub(Events.VARIANT_UNAVAILABLE, !this.currentState.variantId);
        await this._updateCache();
        this._publishUpdates();
        this._updateProps();
        if (this.prop('product-page')) {
            this._updateBrowserHistory();
        }
    }

    async _updateCache() {
        if (Cache.has(this.cacheKey) && !this.prop('no-cache')) return;
        const $listeners = await this._fetchDoc();
        if($listeners) {
            Cache.set(this.cacheKey, {
                listeners: elementsToMap($listeners),
            });
        }
    }

    _updateProps() {
        this.setProp('initial-variant-id', this.currentState.variantId);
        this.setProp('initial-image-position', this.currentState.variantImagePosition);
        this.setProp('initial-selling-plan', this.currentState.sellingPlanId);
    }

    _publishUpdates() {
        if(Cache.has(this.cacheKey)) {
            this.pub(Events.VARIANT_UPDATE, {
                imageIndex: Number(this.currentState.variantImagePosition) - 1,
                imagePosition: this.currentState.variantImagePosition,
                targets: Cache.get(this.cacheKey).listeners,
            })
        }
    }

    get cacheKey() {
        return `${CACHE_KEY}-${this.sectionId}-${this.currentState.variantId}-${this.optionValueIdsString}-${this.currentState.sellingPlanId}`;
    }

    get optionValueIdsString() {
        return this.currentState.optionValueIds.toString();
    }

    async _fetchDoc() {
        const $doc = await $fetch(this.prop('product-url'), {
            before: this._loading(true),
            after: this._loading(false),
            params: {
                selling_plan: this.currentState.sellingPlanId,
                section_id: this.sectionId,
                option_values: this.optionValueIdsString,
            },
            select: `#${this.id}`
        })
        if (this.smartSelect && !this.currentState.variantId) {
            const $availableOptionsJSON = $doc.querySelector('[data-available-options-json]');            
            if (this._smartSelectVariant($availableOptionsJSON)) {    
                // We will get a doc from the next _fetch iteration initiated by smart select
                return null;
            } 
        }             
        return this._getListenersFromDoc($doc);
    }

    _getListenersFromDoc($doc) {
        return Array.from($doc.querySelectorAll('product-variant-listener'));
    }

    _smartSelectVariant(optionsJSON) {
        if(!optionsJSON) {
            console.error('JSON schema for smart select variants is missing');
            return false;
        }

        let options;
        try {
            options = $JSON(optionsJSON);
        } catch (e) {
            console.error(e);
            return false;
        }

        const matchOption = this.optionsHistory.getValidOption(options);

        if(!matchOption) {
            return false;
        }

        this._changeVariant(matchOption);
        return true;
    }

    _loading(state) {
        return () => {
            $loading(this.$('product-meta'), state);
        }
    }

    _updateBrowserHistory() {
        // TODO: refactor to Utils
        window.history.replaceState({}, null, `${window.location.pathname}?${this.historyURLParams.toString()}`);
    }

    _onSellingPlanChange({ sellingPlanId }) {
        this.currentState.sellingPlanId = sellingPlanId;
        this._handleUpdate();
    }

    get historyURLParams() {
        const URLParams = new URLSearchParams({});
        if (this.currentState.variantId) {
            URLParams.set('variant', this.currentState.variantId);
        }
        // else if (!this.currentState.variantId) { //NOTE: leave this here for now. The Dawn avoids this.
        //     URLParams.set('option_values', this.optionValueIdsString);
        // }
        this.currentState.sellingPlanId ? URLParams.set('selling_plan', this.currentState.sellingPlanId) : URLParams.delete('selling_plan');
        return new URLSearchParams(URLParams);
    }
});