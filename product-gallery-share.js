const { Core, Utils } = Global;
const { $state, setDocumentClickHandler } = Utils;

const ACTIVE_CLASSNAME = 'open';

customElements.define('product-gallery-share', class extends Core {
    elements = {
        $: ['trigger-button', 'dropdown']
    }
    isOpen = false;

    render() {
        this.$('trigger-button', { click: this._onTriggerClick });
        this._toggleDocClickListener = setDocumentClickHandler(this._handleOuterClick.bind(this));
    }

    destroy() {
        document.removeEventListener('click', this._handleOuterClick);
    }
    
    _onTriggerClick() {
        this.isOpen = !this.isOpen;
        $state(this, ACTIVE_CLASSNAME, this.isOpen);
        this._toggleDocClickListener(this.isOpen);
    }


    _handleOuterClick(e) {
        if (!this.isOpen) {
            return;
        }
        if(this.contains(e.target)) {
            return;
        } 
        this.isOpen = false;
        this._toggleDocClickListener(false);
        $state(this, ACTIVE_CLASSNAME, false);
    }
})