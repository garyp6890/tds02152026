const { Core, Utils, Cache } = Global;
const { $fetch, debounce, $toggleDisplay, $replaceContent, $active, $loading, setDocumentClickHandler } = Utils;

const RQ_SECTION = 'r_predictive-search';
const RQ_SECTION_SELECTOR = '[data-template]';
const ATTR_NO_RESULTS = 'data-empty-results';
const DEFAULT_MIN_CHARS = 3;
const DEFAULT_LIMIT = 5;
const DEBOUNCE_INTERVAL = 300;

customElements.define('predictive-search', class extends Core {
    propTypes = {
        'results-limit': Number
    }

    elements = {
        $: ['search-input', 'product-type-select', 'button', 'results', 'initial']
    }

    render() {
        this.$('search-input', {
            focus: this._handleFocus,
            input: debounce(this._handleInput.bind(this), DEBOUNCE_INTERVAL)
        });
        this.$('button', {
            click: this._handleButtonClick
        });
        this.$('product-type-select', {
            change: this._handleTypeSelect
        });
        this._toggleDocClickListener = setDocumentClickHandler(this._handleOuterClick.bind(this));
    }

    _handleTypeSelect() {
        this._handleInput();
        this.$('search-input').focus();
    }

    _handleButtonClick(e) {
        if (this.$('search-input').value) return;
        e.preventDefault();
        this.$('search-input').focus(); 
    }

    _handleFocus() {
        this.active = this.minQueryChars || !!this.$('initial');
    }

    async _handleInput() {
        if(!this.minQueryChars) {
            this.showInitial = true;
            this.showResults = false;
            return;
        }
        await this._getQueryResults();
        this._renderQueryResults();
        this.active = true;
    }

    async _getQueryResults() {
        if (!Cache.has(this.query)) {
            const $queryDoc = await this._fetchQueryDoc();
            Cache.set(this.query, {
                hasResults: !$queryDoc.hasAttribute(ATTR_NO_RESULTS),
                content: $queryDoc
            });
        }
    }

    async _fetchQueryDoc() {
        return $fetch(`${routes.predictive_search_url}`, { 
            params: {
                'q': this.query,
                'resources[limit]': this.limit,
                'section_id': RQ_SECTION
            },
            before: this._loading(true),
            after: this._loading(false),
            select: RQ_SECTION_SELECTOR
        });
    }

    _renderQueryResults() {
        const currentQuery = Cache.get(this.query);

        $replaceContent(this.$('results'), currentQuery.content);

        this.showInitial = !currentQuery.hasResults;
        this.showResults = true;
    }

    _handleOuterClick(e) {
        if(!this.contains(e.target) && this.active && document.activeElement !== this.$('search-input')) {
            this.active = false;
        }
    }
    
    _loading(state) {
        return () => {
            $loading(this, state);
        }
    }
    
    set showInitial(state) {
        if(!this.$('initial')) {
            this.active = false;
            return;
        }

        $toggleDisplay(this.$('initial'), state);
        this.active = state;
    }

    set showResults(state) {
        $toggleDisplay(this.$('results'), state);
    }

    set active(state) {
        if (state === this._active) {
            return;
        }
        this._toggleDocClickListener(state)
        $active(this, state);
        this._active = state;
    }

    get active() {
        return !!this._active;
    }

    get minQueryChars() {
        return this.$('search-input').value.trim().length >= DEFAULT_MIN_CHARS;
    }

    get query() {
        const inputValue = this.$('search-input').value.trim();
        if (this.$('product-type-select') && this.$('product-type-select').value !== "") {
            return `product_type:${this.$('product-type-select').value} AND ${inputValue}`
        }
        return inputValue;
    }
    
    get limit() {
        return this.prop('results-limit') || DEFAULT_LIMIT;
    }
});
