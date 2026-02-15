const { Core, Events, Utils } = Global;
const { $replaceContent } = Utils;
const EVENT_SRC = 'filter';

const _setValue = ($element, value) => {
    $element.value = value
}

customElements.define('collection-filter-price', class extends Core {

    elements = {
        $: ['input-min', 'input-max', 'value-min', 'value-max']
    }

    propTypes = {
        'min': Number,
        'max': Number,
        'range-percent': Number,
        'form-id': String
    }

    render() {
        this.$('input-min', {
            change: this._sliderChangeHanlder,
            input: this._handleInput,
        })
        this.$('input-max', {
            change: this._sliderChangeHanlder,
            input: this._handleInput,
        })
        this.sub(Events.COLLECTION_UPDATED, this._handleCollectionUpdate);
    }

    _sliderChangeHanlder() {
        this.pub(Events.COLLECTION_CHANGE, {
            src: EVENT_SRC,
            formId: this.prop('form-id')
        });
    }

    _handleInput({ target }) {
        this._checkInputsIntersection(target);
        this._setRangeStyles();
    }

    _checkInputsIntersection(target) {
        if (target === this.$('input-min') && this.minValue > this.maxValue) {
            this.$('input-min').value = this.maxValue;
        }

        if (target === this.$('input-max') && this.maxValue < this.minValue) {
            this.$('input-max').value = this.minValue;
        }
    }

    _setRangeStyles() {
        const rangeMin = this.minValue / this.prop('range-percent');
        const rangeMax = this.maxValue / this.prop('range-percent');
        this.style.setProperty('--collection-filter-price-range-min', `${rangeMin}%`);
        this.style.setProperty('--collection-filter-price-range-max', `${rangeMax}%`);
    }

    _updateInputValues(min, max) {
        [
            ['input-min', min], 
            ['input-max', max]
        ].map(([ element, value ]) => _setValue(this.$(element), value))
    }

    _handleCollectionUpdate({ src, doc }) {
        if(src === EVENT_SRC) {
            const updated = doc.getElementById(this.id);

            if(!updated) {
                return;
            }

            const [ min, max ] = ['input-min', 'input-max'].map(item => {
                return +updated.querySelector(this.elements[item]).value;
            })

            const [ textContentMin, textContentMax ] = ['value-min', 'value-max'].map(item => {
                return updated.querySelector(this.elements[item]).textContent;
            })

            this._updateInputValues(min, max);
            this.$('value-min').textContent = textContentMin;
            this.$('value-max').textContent = textContentMax;
            this._setRangeStyles();
        }
    }

    get minValue() {
        return this.$('input-min').valueAsNumber;
    }

    get maxValue() {
        return this.$('input-max').valueAsNumber;
    }
})
