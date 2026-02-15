const { Core, Store, Events } = Global;

const STORE_KEY = 'age-confirm';

customElements.define('age-confirm-popup', class extends Core {

    elements = {
        $: ['confirm'],
        modal: 'modal-container'
    }

    render() {
        if(this.isConfirmed) return;

        this._updateTopLayer = this._updateTopLayer.bind(this);
        this._init();
        document.addEventListener('modal-open', this._updateTopLayer);
    };

    async _init() {
        this.$('confirm', {
            click: this._onConfirm
        });
        await customElements.whenDefined('modal-container');
        this.$('modal').open();
    }

    _onConfirm() {
        Store.set(STORE_KEY, true);
        this.$('modal').close();
        this._destroy();
    }

    _updateTopLayer() {
        this.$('modal').refreshLayer();
    }

    _destroy() {
        document.removeEventListener('modal-open', this._updateTopLayer);
        this.remove();
    }

    get isConfirmed() {
        return Store.get(STORE_KEY);
    }
});
