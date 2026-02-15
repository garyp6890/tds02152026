const { Core, Events, Utils, Store, MediaQueries } = Global;
const { getBrowserName, $active, $fetch, parseHTML, $clone, $loading, isFunction, $replaceContent, $toggleDisplay } = Utils;

const COMPARING_URLS_STORE_KEY = 'compare';
const CHECKSUM_STORE_KEY = 'compare-products-check';
const SEL_COMPARE_CONTENT_TEMPLATE = '[data-compare-content-template]';
const SEL_COMPARE_CONTENT = '[data-compare-content]';
const SEL_COMPARE_THUMB_TEMPLATE = '[data-compare-thumb]';
const SEL_COMPARE_THUMB = '[data-compare-thumb]';
const STORAGE_TYPE = 'sessionStorage'; // sessionStorage || localStorage
const STORAGE_KEY_PREFIX_INFO = 'compare-info-html-';
const STORAGE_KEY_PREFIX_THUMB = 'compare-thumb-html-';
const PRODUCTS_LIMIT = 5;
const THUMBS_LIMIT = 9;
const COLUMNS_CSS_PROP = '--products-comparison-popup-columns';

const isOverflown = ({ clientWidth, scrollWidth }) => {
    return scrollWidth > clientWidth;
}

customElements.define('products-comparison', class extends Core {
    propTypes = {
        'checksum': String,
        'products-limit': Boolean,
        'cached': Boolean,
        'sidescroll-info-title': String,
        'sidescroll-info-msg': String,
        'show-bar': Boolean
    }

    iOSPseudoCounter = 0;
    
    elements = {
        $: [
            'compare-button', 
            ['cancel'], 
            'button-counter', 
            'thumbs', 
            'table',
            'modal-close-button'
        ],
        'modal': 'modal-container' 
    }

    productsDocs = {};
    
    render() {
        // this._checkConfiguration();
        this.sub(Events.PRODUCT_COMPARE_OPEN, this._onCompareButtonClick, {global:  true});
        this.sub(Events.PRODUCT_COMPARE_CHANGE, this._onChange, {global:  true});
        this.sub(Events.PRODUCT_COMPARE_UPDATE_REQUEST, this._pubState, {global:  true});
        this.$('modal-close-button', { click: this._closeModal });
        if (this.prop('show-bar')) {
            this.$('cancel', { click: this._onCancel });
            this.$('compare-button', { click: this._onCompareButtonClick });
        }
        this._setInitialState();
    }

    // _checkConfiguration() {
    //     const oldChecksum = window[STORAGE_TYPE].getItem(CHECKSUM_STORE_KEY);
    //     Store.get(COMPARING_URLS_STORE_KEY).map(this._removeInfoFromStorage);
    //     if (oldChecksum !== this.prop('checksum')) {
    //         Store.get(COMPARING_URLS_STORE_KEY).map(this._removeInfoFromStorage);
    //         window[STORAGE_TYPE].setItem(CHECKSUM_STORE_KEY, this.prop('checksum'));
    //     }
    // }
    
    // _removeInfoFromStorage(url) {
    //     window[STORAGE_TYPE].removeItem(`${STORAGE_KEY_PREFIX_INFO}${url}`);
    // }
    
    async _setInitialState() {
        await Promise.all(Store.get(COMPARING_URLS_STORE_KEY).map(this._addProduct.bind(this)));
        await customElements.whenDefined('modal-container');
        this._updateState();
    }

    _updateState() {
        if(this.comparingCount === 0) {
            this._closeModal();
        }
        this._setColumnsNumber();
        this._toggleActiveState();
        this._toggleCompareButton();
        this._pubState();
        this._fixIOSCounter();
    }

    _closeModal() {
        if (this.sidescrollIinfoShowing) {
            this._hideSideScrollInfo();
        }
        this.$('modal').close();
    }

    _fixIOSCounter() {
        if (getBrowserName() !== 'Safari') {
            return
        }
        this.iOSPseudoCounter += 1;
        this.style['counter-reset'] = `thumb-count ${this.iOSPseudoCounter}`;
    }

    async _onChange({ url, state, onError, after }) {
        try {
            if(state) {
                this.initialBarLoading = true;
                await this._addProduct(url);
                Store.add(COMPARING_URLS_STORE_KEY, url);
                this.initialBarLoading = false;
            } else {
                Store.remove(COMPARING_URLS_STORE_KEY, url);
            }
            this._updateState();
        } catch (error) {
            console.error(error);
            isFunction(onError) && onError();
        } finally {
            isFunction(after) && after();
        }
    }

    async _pubState() {
        await customElements.whenDefined('products-comparison-checkbox');
        this.pub(Events.PRODUCT_COMPARE_UPDATE, {
            comparingProductURLs: Store.get(COMPARING_URLS_STORE_KEY),
            limitReached: this.limitReached
        });
    }
    
    _toggleBarCompareButton() {
        this._updateCounterValue();
        this.$('compare-button').toggleAttribute('disabled', this.comparingCount < 2);
    }

    async _addProduct(url) {
        this.loading = true;
        const data = this._getCachedCompareDocs(url) || await this._fetchCompareDocs(url);
        this.prop('show-bar') && this.$('thumbs').appendChild($clone(data.$thumb));
        this.$('table').appendChild($clone(data.$infoContent));
        this.loading = false;
    }
    
    _setToStore(url, data) {
        window[STORAGE_TYPE].setItem(`${STORAGE_KEY_PREFIX_INFO}${url}`, data.$infoContent.outerHTML);
        window[STORAGE_TYPE].setItem(`${STORAGE_KEY_PREFIX_THUMB}${url}`, data.$thumb.outerHTML);
    }

    _getCachedCompareDocs(url) {
        if(!this.prop('cached')) {
            return
        }
        return this.productsDocs[url] || this._getStoredCompareDocs(url);
    }

    _getStoredCompareDocs(url) {
        const info = window[STORAGE_TYPE].getItem(`${STORAGE_KEY_PREFIX_INFO}${url}`);
        if (!info) {
            return
        }
        const docs = {
            $infoContent: parseHTML(info).querySelector(SEL_COMPARE_CONTENT),
            $thumb: undefined
        };
        const thumb = this.prop('show-bar') && window[STORAGE_TYPE].getItem(`${STORAGE_KEY_PREFIX_THUMB}${url}`);
        if (this.prop('show-bar') && !thumb) {
            return
        }
        if (thumb) {
            docs.$thumb = parseHTML(thumb).querySelector(SEL_COMPARE_THUMB);
        }
        this.productsDocs[url] = docs;
        return docs
    }

    async _fetchCompareDocs(url) {
        const $doc = await $fetch(`${url}`, { options: {
            sectionId: this.sectionId
        }});
        const docs = {
            $infoContent: $clone($doc.querySelector(SEL_COMPARE_CONTENT_TEMPLATE)).firstElementChild,
            $thumb: this.prop('show-bar') && $clone($doc.querySelector(SEL_COMPARE_THUMB_TEMPLATE)).firstElementChild
        }
        if(this.prop('cached')) {
            this.productsDocs[url] = docs;
            this._setToStore(url, docs);
        }
        return docs;
    }
    
    _onCancel() {
        Store.clear(COMPARING_URLS_STORE_KEY);
        this._updateState();
        // let animation run smoothly
        setTimeout(() => {
            this._clearThumbs();
            this._clearTable();
        }, 300)
    }

    _updateState() {
        if(this.comparingCount === 0) {
            this.$('modal').close();
        }
        this._setColumnsNumber();
        this._pubState();
        if (this.prop('show-bar')) {
            this._toggleBarActiveState();
            this._toggleBarCompareButton();
            this._fixIOSCounter();
        }
    }

    destroy() {
        this._onCancel();
    }

    _clearThumbs() {
        this.$('thumbs')?.replaceChildren();
    }

    _clearTable() {
        this.querySelectorAll('product-comparison-item').forEach(product => product.remove());
    }

    _onCompareButtonClick() {
        this.$('modal').open();
        this._showSideScrollInfo();
    }

    _hideSideScrollInfo() {
        this.pub(Events.CLOSE_TOAST_NOTIFICATION)
    }

    _showSideScrollInfo() {
        // if (MediaQueries.MOBILE.matches 
        //     || !isOverflown(this.$('table'))
        //     || Store.get('sidescroll-info-shown')
        //     || !this.prop('sidescroll-info-msg') 
        // ) {
        //     return
        // }
        this.pub(Events.TOAST_NOTIFICATION, {
            msg: this.prop('sidescroll-info-msg'),
            title: this.prop('sidescroll-info-title')
        })
        this.sidescrollIinfoShowing = true; 
        Store.set('sidescroll-info-shown', true);
    }

    _toggleBarActiveState() {
        $active(this, this.comparingCount > 0);
    }

    _setColumnsNumber() {
        this.style.setProperty(COLUMNS_CSS_PROP, this.comparingCount);
    }

    _updateCounterValue() {
        this.$('button-counter').innerText = this.comparingCount;
    }

    set initialBarLoading(state) {
        if (this.prop('show-bar')) {
            if (state && this.comparingCount === 0) {
                $loading(this, state);
                this._initialBarLoading = true;
            }
            if (!state && this._initialBarLoading) {
                $loading(this, state);
                this._initialBarLoading = false;
            }
        }
    }

    get comparingCount() {
        return Store.get(COMPARING_URLS_STORE_KEY).length;
    }

    get limitReached() {
        return this.prop('products-limit') && (PRODUCTS_LIMIT <= this.comparingCount);
    }

    set loading(state) {
        if (this.prop('show-bar')) {
            $loading(this.$('compare-button'), state);
        }
    }
})

customElements.define('product-comparison-item', class extends Core {
    propTypes = {
        'product-url': String
    }

    elements = {
        $: ['remove']
    }
    
    render() {
        this.sub(Events.PRODUCT_COMPARE_CHANGE, this._onChange, {global:  true});
        this.$('remove', { click: this._onRemove });
    }

    _onRemove() {
        this.pub(Events.PRODUCT_COMPARE_CHANGE, {
            url: this.prop('product-url'),
            state: false
        });
        this.remove();
    }

    _onChange({ url, state }) {
        if (!state && url === this.prop('product-url')) {
            this.remove();
        };
    }
})