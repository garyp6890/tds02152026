const { Core, Events } = Global;
const EVENT_SRC = 'sort';

customElements.define('collection-sort', class extends Core {
    render() {
        this.$({ change: this._changeHanler });
    }

    _changeHanler(e) {
        setTimeout(() => {
            this.pub(Events.COLLECTION_SORT_CHANGE, { 
                value: e.target.value
            });
        }, 20)
    }
})