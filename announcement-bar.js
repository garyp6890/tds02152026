const { Core, Utils, Store } = Global;
const { $hide, $show } = Utils;

const STORE_KEY = 'close-annoncement';

customElements.define('announcement-bar', class extends Core {
    elements = {
        $: ['close']
    }

    render() {
        if (!Store.get(STORE_KEY)) $show(this);

        this.$('close', {
            click: this._hideAnnouncement
        });
    }

    _hideAnnouncement() {
        Store.set(STORE_KEY, true);
        $hide(this);
    }
});
