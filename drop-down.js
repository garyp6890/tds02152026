const { Core, Utils } = Global;
const { $state, setDocumentClickHandler } = Utils;

const ATTR_DROP_OPTION = 'data-dropdown-option';

customElements.define('drop-down', class extends Core {
    propTypes = {
        'close-on-change': Boolean,
        'update-value': Boolean
    }

    elements = {
        $: ['selected-value', 'select', 'details']
    }

    render() {
        this._toggleDocClickListener = setDocumentClickHandler(this._handleOuterClick.bind(this));
        this.$({
            change: this._handleChange
        })
        
        this.$('select', {
            change: this._handleSelectChange
        })
        this.$('details', {
            toggle: this._handleDetailsToggle
        })
    }

    _handleDetailsToggle() {
        this._toggleDocClickListener(this.$('details').open)
    }

    _handleChange(e) {
        const target = e.target;
        if(target.hasAttribute(ATTR_DROP_OPTION)) {
            e.stopPropagation();
            this._updateSelect(target.value);

            if(this.prop('close-on-change')) {
                this.close();
            }
        }
    }

    _handleOuterClick(e) {
        if(this.contains(e.target)) {
            return;
        } 
        this.close();
    }

    _updateSelect(value) {
        if(this.$('select')) {
            this.$('select').value = value;
            this.$('select').dispatchEvent(new Event('change', {
                bubbles: true
            }));
        }
    }

    _handleSelectChange(e) {
        if(this.prop('update-value') && this.$('selected-value')) {
            this.$('selected-value').innerText = e.target.options[e.target.selectedIndex].text;
        }
    }

    close() {
        this.open = false;
    }

    set open(state) {
        this.$('details').open = state;
    }
});