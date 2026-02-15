const { Core, Events } = Global;

customElements.define('main-nav-mobile', class extends Core {
    elements = {
        $: [['level'], 'toolbar']
    }

    render() {
        this.sub(Events.HEADER_UPDATE, this._handleHeaderUpdate, { global: true, once: true });
        this.sub(Events.HEADER_TOOLBAR_UPDATE, this._handleToolbarUpdate, { global: true, once: true });
        this.$({
            change: this._handleChange
        })
    }
    
    _handleChange(e) {
        this.style.setProperty(
            `--${this.tagName.toLowerCase()}-level`,
            e.target.value
        );
    }

    _handleHeaderUpdate(items) {
        this.$('level').map(level => {
            const match = items.find(item => +level.dataset.level === item.level);
            if(match) {
                level.append(...match.children);
            }
        })
    }

    _handleToolbarUpdate(items) {
        this.$('toolbar').append(...items);
    }
});