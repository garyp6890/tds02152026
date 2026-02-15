const { Core, Events } = Global;

const SELECTOR_INPUT = 'input[name="selling_plan"]';

customElements.define('selling-plan', class extends Core {

    render() {
        this._handleSellingPlanChange = this._handleSellingPlanChange.bind(this)
        this._getSellingPlanInput();
        this._handleSubscriptions();
    }

    _getSellingPlanInput() {
        this.$sellingPlanInput = this.$section.querySelector(SELECTOR_INPUT);
    }

    _handleSubscriptions() {
        if (this.$sellingPlanInput) {
            this.currentSellingPlanId = this.$sellingPlanInput.value;
            this._watchInput();
        }
    }

    _watchInput() {
        this._observeInputValueChange();
        this.$sellingPlanInput.addEventListener('change', this._handleSellingPlanChange);
    }

    _observeInputValueChange = () => {
        this.observer = new MutationObserver(this._handleMutations.bind(this))
        this.observer.observe(this.$sellingPlanInput, { attributes: true, childList: false, subtree: false });
    }

    _handleMutations(mutationsList) {
        const valueChanged = mutationsList.find(mutation => mutation.type === 'attributes' && mutation.attributeName === 'value');
        if (valueChanged) this._handleSellingPlanChange(valueChanged);
    }

    _handleSellingPlanChange({ target }) {
        const newSellingPlanId = target.value;
        if (newSellingPlanId === this.currentSellingPlanId) return;      
        this.currentSellingPlanId = newSellingPlanId;
        this.pub(Events.SELLING_PLAN_CHANGE, {
            sellingPlanId: this.currentSellingPlanId
        });
    }

    destroy() {
        this.observer?.disconnect();
        this.$sellingPlanInput?.removeEventListener('change', this._handleSellingPlanChange);
    }
})
