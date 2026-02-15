const { Core } = Global;

customElements.define('popup-collection', class extends Core {
    elements = {
        modal: ['modal-container']
    }

    render() {
        // prevents nested modals from closing the popup
        this.$('modal', {'modal-close': this._handleClose } );
    }

    _handleClose(e) {
        e.stopPropagation();
    }
});