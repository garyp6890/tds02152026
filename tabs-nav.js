const { Core, Utils } = Global;
const { $active } = Utils;

customElements.define('tabs-nav', class extends Core {
    elements = {
        $: [['tab-nav']]
    }

    render() {
        const [ firstTabNav ] = this.$('tab-nav', {
            click: this._handleTabClick
        })

        this.activeNav = firstTabNav;
    }

    _handleTabClick({ currentTarget }) {
        this._setActive(currentTarget);
    }

    _setActive(current) {
        if (current === this.activeNav) return;

        if (window.innerWidth <= 992 ) {
            current.scrollIntoView({ behavior: 'smooth', inline: "center", block: "nearest" });
        }

        if(this.activeNav) {
            $active(this.activeNav, false);
        }

        this.activeNav = current;
        $active(this.activeNav);
    }
});
