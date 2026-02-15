const { Core, Utils } = Global;
const { $hide, $show, $active, $state, $JSON } = Utils;


customElements.define('product-options-list', class extends Core {
    propTypes = {
        'enable-sorting': Boolean
    }

    elements = {
        $: ['product-JSON', 'stock-only-toggle', 'table-body', ['column-header']]
    }

    isSorted = false;
    isSortReversed = false;
    sortBy = '';

    render() {
        this._getInitialData();
        this.prop('enable-sorting') && this.$('column-header', { click: this._sortRows });
        this.$('stock-only-toggle', { change: this._toggleAvailable });
    }

    _getInitialData() {
        this.variants = $JSON(this.$('product-JSON'));
        this.$rows = Array.from(this.$('table-body').rows);
    }

    _sortRows({ currentTarget }) {
        if(currentTarget.dataset.colName === this.sortBy) {
            this.variants.reverse();
            this.isSortReversed = !this.isSortReversed;
        } else {
            this.sortBy = currentTarget.dataset.colName;
            this._sortVariants();
            this.isSortReversed = false;
        }
        this._toggleActiveHeader(currentTarget);
        this._renderSorted();
    }

    _toggleActiveHeader(currentHeader) {
        if (!!this.activeHeader) {
            $active(this.activeHeader, false);
            $state(this.activeHeader, 'reverse', false);
        };
        this.activeHeader = currentHeader;
        $active(this.activeHeader);
        $state(this.activeHeader, 'reverse', this.isSortReversed);
    }

    _sortVariants() {
        const compareProperties = (variantA, variantB) => {
            const propA = variantA[this.sortBy].toString();
            const propB = variantB[this.sortBy].toString();
            return propA.localeCompare(propB, undefined, { numeric: true })
        };
        this.variants.sort(compareProperties);
    }

    _renderSorted() {
        this.variants.map(variant => {
            const matchedItem = this.$rows.find(this._getRowByVariantId(variant));
            this.$('table-body').appendChild(matchedItem);
        })
        this.isSorted = true;
    }

    _getRowByVariantId(variant) {
        return (item) => +item.dataset['variantId'] === variant.id;
    }

    _toggleAvailable(e) {
        $state(this, 'stock-only', e.target.checked);
    }
})