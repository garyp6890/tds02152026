const { Core, Utils } = Global;
const { $show } = Utils;

customElements.define('localization-dropdown', class extends Core {
    elements = {
        $: ['spinner'],
        form: 'form'
    }

    render() {
        this.$('form', {
            change: this._onFormChange
        });
    }

    _onFormChange() {
        $show(this.$('spinner'));
        this.$('form').submit();
    }
});
