const { Core, Utils } = Global;
const { $active, setDocumentClickHandler } = Utils;

customElements.define('main-nav', class extends Core {
    elements = {
        $: [['nav-item']]
    }

    render() {
        this.$('nav-item', {click: this._handleItemClick});
        this._toggleDocClickListener = setDocumentClickHandler(this._handleOuterClick.bind(this));
    }

    _handleItemClick(e) {
        if (e.target.parentNode === e.currentTarget) {
            e.preventDefault();
            this._setActiveNav(e.currentTarget);
        }
    }

    _setActiveNav(navItem) {
        if(this.activeItem) {
            $active(this.activeItem, false);
        }

        if (this.activeItem === navItem) {
            this.activeItem = null;
            this._toggleDocClickListener(false);
            return;
        };
        this.activeItem = navItem;
        $active(this.activeItem);
        this._toggleDocClickListener(true);
    }

    _handleOuterClick(e) {
        if(this.activeItem && !this.contains(e.target)) {
            $active(this.activeItem, false);
            this.activeItem = null;
            this._toggleDocClickListener(false);
        }
    }
});