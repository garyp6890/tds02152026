const { Core } = Global;

customElements.define('main-nav-drawer', class extends Core {
    elements = {
        stage: '[data-stage]',
        $: [['to-lvl']]
    }

    render() {
        this.$('to-lvl', {
            click: this._handleNavigation
        })
    }
    
    _handleNavigation({ currentTarget }) {
        this.$('stage').dataset.lvl = currentTarget.dataset.toLvl;
    }
});