const { Core, Events } = Global;

customElements.define('main-nav-mobile-toolbar', class extends Core {
    render() {
        customElements.whenDefined('main-nav-mobile').then(() => {
            this.pub(Events.HEADER_TOOLBAR_UPDATE, this.childNodes);
            this.remove();
        })
    }
})