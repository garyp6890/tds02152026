const { Core, Events } = Global;

customElements.define('main-nav-mobile-loader', class extends Core {
    elements = {
        $: [['level']]
    }

    render() {
        customElements.whenDefined('main-nav-mobile').then(() => {
            this.pub(Events.HEADER_UPDATE, this._getLevels());
            this.remove();
        })
    }

    _getLevels() {
        return this.$('level').map(item => {
            return {
                level: +item.dataset.level,
                children: item.childNodes
            }
        })
    }
})