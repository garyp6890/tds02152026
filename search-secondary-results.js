const { Core } = Global;
const { $fetch, $replaceContent } = Global.Utils;

customElements.define('search-secondary-results', class extends Core {
    propTypes = {
        query: String,
        target: String
    }

    elements = {
        $: ['template', 'content']
    }

    render() {
        this._setContent();
    }
    
    async _setContent() {
        const $queryDoc = await this._fetchQueryDoc();

        if ($queryDoc) {
            $replaceContent(this, this.$('template'));
            $replaceContent(this.$('content'), $queryDoc);
        }
    }

    async _fetchQueryDoc() {
        return $fetch(this.prop('query'), {
            select: `[data-target="${this.prop('target')}"]`
        })
    }
});
