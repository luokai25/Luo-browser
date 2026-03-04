// Luo Desktop - Media Player App
class MediaPlayer {
    constructor() {
        this.currentTrack = null;
        this.playlist = [];
        this.isPlaying = false;
        this.volume = 0.7;
        this.repeat = 'none'; // none, one, all
        this.shuffle = false;
        
        // Demo playlist
        this.playlist = [
            { id: 1, title: 'Ambient Dreams', artist: 'Lo-Fi Studio', duration: '3:45', cover: '🎵' },
            { id: 2, title: 'Night Drive', artist: 'Synthwave', duration: '4:12', cover: '🎹' },
            { id: 3, title: 'Coding Flow', artist: 'Focus Beats', duration: '2:58', cover: '🎧' },
            { id: 4, title: 'Sunset Vibes', artist: 'Chill Mix', duration: '3:22', cover: '🌅' },
            { id: 5, title: 'Deep Focus', artist: 'Study Music', duration: '5:01', cover: '📚' },
        ];
        
        this.currentIndex = 0;
    }

    render() {
        return `
            <div class="media-player">
                <div class="player-main">
                    <div class="player-cover">
                        <span class="cover-icon">${this.playlist[this.currentIndex].cover}</span>
                    </div>
                    <div class="player-info">
                        <div class="track-title">${this.playlist[this.currentIndex].title}</div>
                        <div class="track-artist">${this.playlist[this.currentIndex].artist}</div>
                    </div>
                    <div class="player-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 35%"></div>
                        </div>
                        <div class="progress-time">
                            <span>1:18</span>
                            <span>${this.playlist[this.currentIndex].duration}</span>
                        </div>
                    </div>
                    <div class="player-controls">
                        <button class="control-btn shuffle" title="Shuffle">🔀</button>
                        <button class="control-btn prev" title="Previous">⏮️</button>
                        <button class="control-btn play-pause" title="${this.isPlaying ? 'Pause' : 'Play'}">
                            ${this.isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <button class="control-btn next" title="Next">⏭️</button>
                        <button class="control-btn repeat" title="Repeat: ${this.repeat}">${this.getRepeatIcon()}</button>
                    </div>
                </div>
                <div class="player-playlist">
                    <div class="playlist-header">Queue</div>
                    <div class="playlist-items">
                        ${this.playlist.map((track, i) => `
                            <div class="playlist-item ${i === this.currentIndex ? 'active' : ''}" data-index="${i}">
                                <span class="item-cover">${track.cover}</span>
                                <div class="item-info">
                                    <div class="item-title">${track.title}</div>
                                    <div class="item-artist">${track.artist}</div>
                                </div>
                                <span class="item-duration">${track.duration}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="player-volume">
                    <button class="volume-btn">🔊</button>
                    <div class="volume-slider">
                        <div class="volume-fill" style="width: ${this.volume * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getRepeatIcon() {
        switch(this.repeat) {
            case 'one': return '🔂';
            case 'all': return '🔁';
            default: return '🔁';
        }
    }

    play() {
        this.isPlaying = true;
        this.updateUI();
    }

    pause() {
        this.isPlaying = false;
        this.updateUI();
    }

    togglePlay() {
        this.isPlaying ? this.pause() : this.play();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.updateUI();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.updateUI();
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.updateUI();
    }

    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIdx = modes.indexOf(this.repeat);
        this.repeat = modes[(currentIdx + 1) % modes.length];
        this.updateUI();
    }

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        this.updateUI();
    }

    playTrack(index) {
        this.currentIndex = index;
        this.play();
    }

    updateUI() {
        // Would update the DOM dynamically
    }
}

// Mini Player for Taskbar
class MiniPlayer {
    constructor() {
        this.isPlaying = false;
        this.track = { title: 'No track playing', artist: '' };
    }

    render() {
        return `
            <div class="mini-player">
                <div class="mini-info">
                    <span class="mini-title">${this.track.title}</span>
                    ${this.track.artist ? `<span class="mini-artist">${this.track.artist}</span>` : ''}
                </div>
                <div class="mini-controls">
                    <button class="mini-btn">⏮️</button>
                    <button class="mini-btn play">${this.isPlaying ? '⏸️' : '▶️'}</button>
                    <button class="mini-btn">⏭️</button>
                </div>
            </div>
        `;
    }
}

window.mediaPlayer = new MediaPlayer();
