const { Core, onPlyrLoad, Utils } = Global;
const { $replaceContent } = Utils;

customElements.define('video-player', class extends Core {
    elements = {
        $: ['player', 'video-template', 'video-wrapper'],
        HTML5Player: 'video'
    }

    propTypes = {
        'loop': Boolean,
        'inited': Boolean
    }
    
    render() {
        if (this.prop('inited') ) {
            $replaceContent(this.$('video-wrapper'), this.$('video-template'));
        }
        onPlyrLoad(this._initPlayer.bind(this));
    }

    _initPlayer() {
        this.player = new Plyr(this.$player, {
            ratio: '16:9',
        });
        this.player.loop = this.prop('loop');
        this.setAttribute('inited', '');
    }

    play() {
        this.player?.play();
    }

    pause() {
        this.player?.pause();
    }

    get $player() {
        return this.$('player') || this.$('HTML5Player');
    }

    destroy() {
        this.player.destroy();
    }
})