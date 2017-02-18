Vue.filter('minutesSeconds', function(value) {
    if (!value) return '';
    minutes = Math.floor(value / (1000 * 60));
    seconds = ('00' + Math.floor((value / 1000) % 60)).slice(-2);
    return minutes + ':' + seconds;
})

Vue.filter('formatNumbers', function(value) {
    if (!value) return '';
    filteredValue = value.toString();
    if (value > 999 && value < 1000000) {
        filteredValue = filteredValue.substring(0, filteredValue.length - 3) + '.' + filteredValue.substring(filteredValue.length - 3);
    }
    if (value > 1000000) {
        filteredValue = filteredValue.substring(0, filteredValue.length - 6) + '.' + filteredValue.substring(filteredValue.length - 6, filteredValue.length - 3) + '.' + filteredValue.substring(filteredValue.length - 3);
    }
    return filteredValue;
})

Vue.component('search-box', {
    props: ['getSearchResult'],
    template: `<div id="searchBox">
        <input  v-on:keyup.enter="getSearchResult('search',searchquery)" id="query" v-model="searchquery" :value="searchquery" type="text" autofocus>
        <button id="searchButton" v-on:click="getSearchResult('search', searchquery)" >Search</button>
    </div>`,
    data: function() {
        var nowQuery = (new Date().getHours() % 12); // For fun query to start up with
        if (nowQuery == 0) { nowQuery = 12; }
        //return { searchquery: nowQuery + ' O\'clock' }       
        return { searchquery: 'love' };
    },
    created: function() {
        this.getSearchResult('search', this.searchquery); // This fires initial search for faster development
    },
})

Vue.component('search-pager', {
    props: ['total', 'offset', 'getSearchResult'],
    template: `<div  class="pager" v-show="total > 20">
        <button class="previous" v-on:click="getSearchResult('paging','previous')">Previous</button>
        <button class="next" v-on:click="getSearchResult('paging','next')">Next</button>
        <span>Showing {{ offset + 1 }} - {{ offset + 20 }} of {{ total | formatNumbers }} results</span>
    </div>`
})

Vue.component('search-top', {
    props: ['searchResult', 'getTrackData', 'offset'],
    template: `<div  class="top" v-if="searchResult.length > 0">
        <div class="top-container">
            <div v-on:click="toggleTop10()" class="top-item last arrow">{{ offset + 1 }} - {{ offset + 11 }}</div>
            <div v-for="(track, index) in searchResult" v-on:click="getTrackData(track.id)" class="top-item first" v-if="index < 10">
                <div class="ellipsis text">{{ track.name }}</div>
                <img :src="track.album.images[1].url" alt="album photo" />
                <div class="ellipsis text">{{ track.artists[0].name }}</div>
            </div>
            <div v-for="(track, index) in searchResult" v-on:click="getTrackData(track.id)" class="top-item last" v-if="index >= 10">
                <div class="ellipsis text">{{ track.name }}</div>
                <img :src="track.album.images[1].url" alt="album photo" />
                <div class="ellipsis text">{{ track.artists[0].name }}</div>
            </div>
            <div v-on:click="toggleTop10()" class="top-item first arrow">{{ offset + 11 }} - {{ offset + 21 }}</div>
        </div>
    </div>`,
    methods: {
        toggleTop10: function() {
            if ($(".top-item.first").is(":visible")) {
                $(".top-item.first").fadeOut(100);
                $(".top-item.last").delay(100).fadeIn(200);
            } else {
                $(".top-item.last").fadeOut(100);
                $(".top-item.first").delay(100).fadeIn(200);
            }

        }
    }
})

Vue.component('search-result', {
    props: ['searchResult', 'offset', 'getArtistData', 'getTrackData'],
    template: `<div id="searchresultTable">
    <p v-if="searchResult.length == 0">No search result</p>
    <table v-if="searchResult.length > 0">
        <thead>
            <tr>
                <th class="no">No.</th>
                <th>Track</th>
                <th>Artist</th>
                <th>Duration</th>
                <th>Popularity</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(track, index) in searchResult">
                <td class="no">{{index + 1 + offset}}</td>
                <td v-on:click="getTrackData(track.id)" class="link">{{track.name}}</td>
                <td><span v-for="artist in track.artists" v-on:click="getArtistData('artist', artist.id)"><span class="link">{{artist.name}}</span>, <span></td>
                <td>{{track.duration_ms | minutesSeconds }}</td>
                <td>{{ track.popularity }}%</td>
            </tr>
        <tbody>
    </table>
    </div>`,
    data: function() {
        return {}
    },
    /* experimenting with sorting
        computed: {
            orderedsearchResult: function() {
                return _.orderBy(this.searchResult, 'popularity')
            }
        },*/
    created: function() {
        //console.log('orderedsearchResult', this.orderedsearchResult)
    },
})


Vue.component('artist-modal', {
    props: ['modalData'],
    template: `<div  class="dataModal artist">
    <div class="hidePopUp" onclick="$('.dataModal, #overlay').hide()">×</div>
    <h2>{{ modalData.name }}</h2>
    <div class="column1">
    <img :src="modalData.images[1].url" alt="artist photo" />
    </div>
    <table>
        <thead>
            <tr>
                <th colspan="2">{{ modalData.name }}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Popularity</td>
                <td>{{ modalData.popularity }}%</td>
            </tr>
            <tr>
                <td>Followers</td>
                <td>{{ modalData.followers.total | formatNumbers}}</td>
            </tr>
            <tr>
                <td>Genres</td>
                <td><span class="genreTag" v-for="genre in modalData.genres">{{ genre }}, </span>
                </td>
            </tr>
            <tr>
                <td>Spotify link</td>
                <td><a href="modalData.external_urls.spotify">{{ modalData.name }}</a></td>
            </tr>
        </tbody>
    </table>
    </div>`
})

Vue.component('track-modal', {
    props: ['trackData'],
    template: `<div  class="dataModal track">
    <div class="hidePopUp" onclick="$('.dataModal, #overlay').hide()">×</div>
        <h2>{{ trackData.name }}</h2>
        <div class="column1">
            <img :src="trackData.album.images[1].url" alt="album photo" />
            <p>Artists: <span v-for="artist in trackData.artists">{{ artist.name }}, </p>           
            <p>Album: {{ trackData.album.name }}</p>
            <p>
                <a v-bind:href="trackData.external_urls.spotify" class="playbtn" target="_blank">Play on Spotify</a>
            </p>
        </div> 
        <table>
            <thead>
                <tr>
                    <th colspan="2">{{ trackData.name }}</th>
                </tr>
            </thead>
            <tr>
                <td>Popularity</td>
                <td>{{trackData.popularity }}%</td>
            </tr>
            <tr>
                <td>Duration</td>
                <td>{{trackData.duration_ms | minutesSeconds }}</td>
            </tr>
            </tr>
            <tr>
                <td>Album</td>
                <td>{{trackData.album.name }}</td>
            </tr>
            </tr>
            <tr>
                <td>Track number</td>
                <td>{{trackData.track_number }}</td>
            </tr>
            </tr>
            <tr>
                <td>Explicit</td>
                <td>{{ trackData.explicit?'Hell Yeah!':'No' }}</td>
            </tr>
        </table>
    </div>`
})

app = new Vue({
    el: '#main',
    data: {
        searchResult: {},
        modalData: {
            followers: {},
            images: ['', ''] // images defined because of some kind of vue.js codecheck before rendering. 
        },
        trackData: {
            album: { 'images': ['', ''] }, // images defined because of some kind of vue.js codecheck before rendering. 
            external_urls: {}
        },
        previous: null,
        next: null,
        total: 0,
        offset: 0
    },
    components: {},
    methods: {
        getSearchResult: function(action, param1) {

            if (action === 'search') {
                if (param1 === '') { return };
                spotifyUrl = 'https://api.spotify.com/v1/search?q=' + param1 + '&type=track&limit=20'
            }
            if (action === 'paging') {
                if (param1 === 'next') {
                    if (!this.next) { // Checking if there's more results
                        return;
                    }
                    spotifyUrl = this.next;
                }
                if (param1 === 'previous') {
                    if (!this.previous) { // Checking if this is the first result
                        return;
                    }
                    spotifyUrl = this.previous;
                }
            }
            $('#spinner,#overlay').show();
            this.$http.get(spotifyUrl).then(response => {
                this.searchResult = response.body.tracks.items;
                this.total = response.body.tracks.total;
                this.offset = response.body.tracks.offset;
                this.previous = response.body.tracks.previous;
                this.next = response.body.tracks.next;
                $('.previous,.next').removeAttr('disabled');
                if (!this.previous) {
                    $('.previous').attr('disabled', 'disabled');
                }
                if (!this.next) {
                    $('.next').attr('disabled', 'disabled');
                }
                console.log('response.body.tracks: ', response.body.tracks.items);
                $('#spinner,#overlay').hide();
            }, response => {
                console.log('error callback', response);
            });

        },
        getArtistData: function(type, id) {
            if (type === 'artist') {
                $('#spinner,#overlay').show();
                var spotifyUrl = "https://api.spotify.com/v1/artists/" + id;
                this.$http.get(spotifyUrl).then(response => {
                    this.modalData = response.body;
                    console.log('response.body: ', response.body);
                    $('#spinner').hide();
                    $('.dataModal.artist').show();
                }, response => {
                    console.log('error callback', response);
                });
                console.log('getArtistData i roden, Type, id ', type, id)
            }

        },
        getTrackData: function(id) {
            $('#overlay').show();
            for (var i = 0; i < this.searchResult.length; i++) {
                if (this.searchResult[i].id == id) {
                    this.trackData = this.searchResult[i];
                }
            }
            $('.dataModal.track').show();
            console.log('this.trackData ', this.trackData)
        }

    }
});