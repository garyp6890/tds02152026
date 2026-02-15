const { Core, Utils, Events } = Global;
const { $active, $show, $toggleDisplay } = Utils;

const SEARCH_INPUT_SELECTOR = '[data-element="search-input"]';
const RECOGNITION_DEFAULT_LANG = 'en-US';

customElements.define('voice-search', class extends Core {
    elements = {
        $: ['trigger', 'text-content', 'repeat', 'close'],
        modal: 'modal-container'
    }

    propTypes = {
        'predictive-search': Boolean,
        //TODO: Need to deprecate the strings props here
        'default-message': String,
        'repeat-message': String
    }

    render() {
        this.$searchForm = this.parentNode;
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.lang = RECOGNITION_DEFAULT_LANG;
            this.recognition.interimResults = true;

            this.isListening = false;
            this.searchQueryStr = null;
            //TODO: Need to avoid direct search input selection
            this.$searchInput = this.$searchForm.querySelector(SEARCH_INPUT_SELECTOR);

            this.$('trigger', {
                click: this._startRecognition 
            });
            this.$('repeat', {
                click: this._startRecognition
            });

            this.$({
                'modal-close': this._handleClose
            });

            this._setRecognitionListeners();
        } else {
            this.remove();
            return;
        }
    }

    _startRecognition() {
        this.$('modal')._open();
        this.recognition.start(); 
    }

    _handleClose(e) {
        e.stopPropagation();
        this.recognition.stop();
    }

    _setRecognitionListeners() {
        this.recognition.addEventListener('start', this._handleStart.bind(this));
        this.recognition.addEventListener('end', this._handleRecognition.bind(this));
        this.recognition.addEventListener('result', this._handleResult.bind(this));
        this.recognition.addEventListener('error', this._handleError.bind(this));
    }

    _handleStart() {
        this._active();
        this._setTextContent(this.prop('default-message'));
    }

    _handleRecognition() {
        this._active(false);

        if (!this.searchQueryStr) {
            this._setTextContent(this.prop('repeat-message'));
            return;
        }
        
        this.$('modal')._close();
        this._handleSearchForm();
    }

    _active(state=true) {
        this.isListening = state;
        $active(this, state);
    }

    _handleResult({ results }) {
        const result = Array.from(results).reduce((str, result) => {
            return str + " " + result[0].transcript;
        }, '');

        this._setTextContent(result);
        this.searchQueryStr = result;
    }

    _handleSearchForm() {
        this.$searchInput.focus();
        this.$searchInput.value = this.searchQueryStr;
        
        if (this.prop('predictive-search')) {
            this.$searchInput.dispatchEvent(new Event('input'));
        } else {
            this.$searchForm.submit();
        }

        this.searchQueryStr = null;
    }

    _handleError(e) {
        //TODO: Now Toast Notification popup appears behind the modal
        this.pub(Events.TOAST_NOTIFICATION, {
            type: 'error',
            msg: e.message || '',
            title: e.error
        })
    }

    _setTextContent(value) {
        this.$('text-content').textContent = value;
        $toggleDisplay(this.$('repeat'), !this.searchQueryStr && !this.isListening);
    }
});