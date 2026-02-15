const { Core, Utils, Events, Cache } = Global;
const { $fetch, $loading } = Utils;

customElements.define('collection-provider', class extends Core {

    elements = {
        $: [['collection-form'], 'loader']
    }

    propTypes = {
        'collection-url': String,
        'sort-by': String
    }

    render() {
        this._getForms();
        this.sub(Events.COLLECTION_CHANGE, this._handleChange);
        this._initCache();
        this.sortBy && this.sub(Events.COLLECTION_SORT_CHANGE, this._handleSortChange);
    }

    _getForms() {
        this.$forms = new Map();
        this.$('collection-form').map((form) => {
            this.$forms.set(form.id, form);
        });
    }
    
    async _handleChange({ src, url, formId }) {
        this.src = src;
        this._getUrlParams(url, formId);
        await this._getDoc();
        this._updateHistory();
        this.pub(Events.COLLECTION_UPDATED, { src, doc: this.$doc });
    }

    async _handleSortChange({ value }) {
        this.sortBy = value;
        this.urlParams.set('sort_by', value);
        await this._getDoc();
        this._updateHistory();
        this.pub(Events.COLLECTION_UPDATED, { src: 'sort', doc: this.$doc });
    }

    set src(value) {
        const inert = (value === 'dynamic-pagination');
        this.withLoading = !inert;
        if(!inert) {
            this._scrollToTop();
        }
    }

    _initCache() {        
        this.sortBy = this.prop('sort-by');
        const firstFormId = this.$forms.keys().next().value;
        this._getUrlParams(undefined, firstFormId);
        Cache.set(
            this.urlParams.toString(),
            document.cloneNode(true)
        );
    }

    _getUrlParams(url, formId) {
        if(!url && !formId) {
            console.error('collection change does not contain resource');
            return;
        }
        const searchParams = url
            ? new URL(`${window.location.origin}${url}`).searchParams
            : new URLSearchParams(this._formData(formId));
        this.sortBy && searchParams.set('sort_by', this.sortBy);
        this.urlParams = searchParams; 
    }

    _updateHistory() {
        this.urlParams.delete('section_id');
        window.history.pushState({}, null, `${window.location.pathname}?${this.urlParams.toString()}`);
    }

    _formData(formId) {
        if(!this.$forms.has(formId)) {
            console.error(`form not found with id ${formId}`);
            return;
        }
        return new FormData(this.$forms.get(formId));
    }

    async _getDoc() {
        const cacheId = this.urlParams.toString();
        if(Cache.has(cacheId)) {
            this.$doc = Cache.get(cacheId);
            return;
        }

        this.$doc = await this._fetchDoc();
        Cache.set(cacheId, this.$doc);
    }

    async _fetchDoc(urlParamsStr) {
        const doc = await $fetch(this.prop('collection-url'), {
            before: this._loading(true),
            after: this._loading(false),
            sectionId: this.sectionId,
            params: this.urlParams
        });
        return doc;
    }

    _loading(state) {
        return () => {
            if(!this.withLoading && state) {
                return;
            }
            $loading(this.$('loader'), state);
        }
    }

    _scrollToTop() {
        window.scrollTo({
            top: this.topPoint + window.pageYOffset,
            behavior: 'smooth',
        });
    }

    get topPoint() {
        const headerHeight = document.documentElement.style.getPropertyValue('--header-height')?.replace('px', '');
        const offset = this.getBoundingClientRect().top;
        return headerHeight ? offset - headerHeight : offset;
    }
})