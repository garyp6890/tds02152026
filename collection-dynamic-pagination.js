const { Core, Utils, Events } = Global;
const { $toggleDisplay, $loading } = Utils;

const OBSERVER_BOTTOM_OFFSET = '25%';
const EVENT_SRC = 'dynamic-pagination';

customElements.define('collection-dynamic-pagination', class extends Core {
    elements = {
        $: ['load-button', 'input']
    }

    propTypes = {
        'total-pages': Number,
        'current-page': Number,
        'type': String,
        'form-id': String
    }

    render() {
        this.sub(Events.COLLECTION_UPDATED, this._handleCollectionUpdate);
        
        this._initCurrentState();
        this._handleTrigger();
        this._checkEdge();
    }

    _handleTrigger() {
        switch (this.prop('type')) {
            case 'scroll':
                this._handleEdgeScroll();
                this.$loadingTarget = this;
                break;
            case 'button':
                this._handleButton();
                this.$loadingTarget = this.$('load-button');
                break;
            default:
                throw new Error(`unknown type ${this.prop('type')}`);
        }
    }

    _handleCollectionUpdate({ src, doc }) {
        this.$('input').disabled = true;

        if(src === EVENT_SRC) {
            this.loading = false;
            this._checkEdge();
            return;
        }

        const updatedDoc = doc.getElementById(this.id);
        if(!updatedDoc) {
            return;
        }

        this.currentPage = +updatedDoc.getAttribute('current-page');
        this.totalPages = +updatedDoc.getAttribute('total-pages');
        this._checkEdge();
    }

    _handleButton() {
        this.$('load-button', { click: this._loadNextPage })
    }

    _initCurrentState() {
        this.currentPage = this.prop('current-page');
        this.totalPages = this.prop('total-pages');
    }

    _handleEdgeScroll() {
        const observer = new IntersectionObserver(([ entry ]) => { 
            entry.isIntersecting && this._loadNextPage();
        }, {
            rootMargin: `0px 0px ${OBSERVER_BOTTOM_OFFSET} 0px`
        });
        observer.observe(this);
    }

    async _loadNextPage() {
        if(this.currentPage >= this.totalPages) {
            this.edge = true;
            this.loading = false;
            return;
        }

        this.loading = true;
        this.currentPage += 1;

        this.$('input').disabled = false;
        this.$('input').value = this.currentPage;

        this.pub(Events.COLLECTION_CHANGE, {
            src: EVENT_SRC,
            formId: this.prop('form-id')
        });
    }

    _checkEdge() {
        this.edge = this.currentPage === this.totalPages; 
    }

    set loading(state) {
        $loading(this.$loadingTarget, state);
    }

    set edge(state) {
        $toggleDisplay(this.$loadingTarget, !state);
    }
})