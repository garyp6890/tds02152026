const { Core, Utils } = Global;
const { $toggleDisplay, $isHidden, $hide, $show } = Utils;
customElements.define('customer-address-province-selector', class extends Core {
    elements = {
        $: ['selector']
    }

    propTypes = {
        default: String
    }
    
    update({ provinces }) {
        if(!provinces.length) {
            if(!$isHidden(this)) {
                this.$('selector').replaceChildren();
                $hide(this);
            }
            return;
        }
        this._setOptions(provinces);
    }
    
    _setOptions(data) {
        const options = data.map(this._createOption.bind(this));
        this.$('selector').replaceChildren(...options);
        $show(this)
    }

    _createOption([ value, text ]) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        if(this.prop('default') === value) {
            option.selected = true;
        }
        return option;
    }
})

customElements.define('customer-address-country-selector', class extends Core {
    elements = {
        options: ['option']
    }
    
    propTypes = {
        default: String,
        'form-id': String
    }

    render() {
        this._setInitial();            
        this.addEventListener('change', this._changeHandler);
    }

    async _setInitial() {
        await this._initProvinceSelector();
        const initialOption = 
            this.prop('default')
            ? this.$('options').find(({ value }) => value === this.prop('default'))
            : this.$('options').find(({ selected }) => selected);

        initialOption.selected = 'selected';
        this._updateProvinceSelector({
            value: initialOption.value,
            provinces: initialOption.dataset.provinces
        });
    }
    
    async _initProvinceSelector() {
        await customElements.whenDefined('customer-address-province-selector');
        this.$provinceSelector = document.querySelector(`customer-address-province-selector[form-id="${ this.prop('form-id') }"]`);

    }

    _updateProvinceSelector({ value, provinces }) {
        this.$provinceSelector.update({
            value,
            provinces: JSON.parse(provinces)
        })
    }
    
    _changeHandler(e) {
        this._updateProvinceSelector({
            value: e.target.value,
            provinces: e.target.options[e.target.selectedIndex].dataset.provinces
        })
    }
})