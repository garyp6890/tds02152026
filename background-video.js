const { Core, onPlyrLoad, Utils } = Global;

customElements.define('background-video', class extends Core {

    elements = {
        $: ['template', 'content']
    }

    propTypes = {
        'desktop-only': Boolean
    }

    inited = false;
    
    render() {
        if (this.prop('desktop-only') && document.documentElement.clientWidth <= 992) {
            this.remove();
            return;
        }

        this._forwardToPrevTime = this._forwardToPrevTime.bind(this);
        this._handlePlaying = this._handlePlaying.bind(this);
        onPlyrLoad(this._observe.bind(this));
    }

    _observe() {
        this.intersectionObserver.observe(this);
    }

    _initPlayer([ entry ]) {
        if(!entry.isIntersecting) {
            this.player?.pause();
            return
        } 
        if(this.player) {
            this.player.play();
            return
        }
        this._initContainer();
        this.player = new window.Plyr(this.playerContainer, {
            muted: true,
            controls: [],
            clickToPlay: false,
            fullscreen: false,
            settings: []
        });
        
        this.player.once('ready', this.player.play);
        this.prevTime && this.player.on('play', this._forwardToPrevTime);
        this.player.on('ended', this.player.restart);
        this.player.once('error', this.remove);
        this.player.on('playing', this._handlePlaying);
    }

    _handlePlaying() {
        if(!this.inited) {
            this.inited = true;
            Utils.$state(this, 'inited');
        }
    }

    _initContainer() {
        this.playerContainer = this.$('template').content.cloneNode(true).firstElementChild;
        this.$('content').appendChild(this.playerContainer);
    }

    _forwardToPrevTime() {
        this.player.forward(this.prevTime)
    }

    destroy() {
        if(this.player) {
            this.prevTime = this.player.currentTime;
            this.player.off('play', this._forwardToPrevTime);
            this.player.off('ended', this.player.restart);
            this.player.off('ready', this.player.play);
            this.player.off('error', this.remove);
            this.player.off('playing', this._handlePlaying);
            this.player.destroy();  
            this.playerContainer.remove();
            this.player = null;
        }
        this.inited = false;
        Utils.$state(this, 'inited', false);
        this.intersectionObserver.disconnect();
    }

    get intersectionObserver() {
        return new IntersectionObserver(this._initPlayer.bind(this), {
            rootMargin: '0px -10% 0px 0px'
        });
    }
})
