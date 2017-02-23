Vue.filter('minutesSeconds', function (value) {
    if (!value) return '';
    minutes = Math.floor(value / (1000 * 60));
    seconds = ('00' + Math.floor((value / 1000) % 60)).slice(-2);
    return minutes + ':' + seconds;
})

Vue.filter('formatNumbers', function (value) {
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
    template: `
    <div id="searchBox">
        <input id="query" type="text" value="love" autofocus>
        <button id="searchButton" v-on:click="getSearchResult('search', searchquery)">Search</button>
    </div>`,
    subscriptions() {
        return {
            // Dette er en observable som fyrer på keyup fra #query-elementet.
            inputValue: this.$fromDOMEvent('#query', 'keyup').pluck('target', 'value')
                .debounce(300)                                          // Vent til der ikke er tastet i 300ms
                .distinctUntilChanged()                                 // Fyr kun hvis værdien har ændret sig
                .filter(query => query.length > 0)                      // Filtrer tomme værdier fra.
                .startWith('love')                                      // Start med søgningen 'love'
                .do(query => this.getSearchResult('search', query))     // Fyr søgningen.
        }
    }
})

Vue.component('search-pager', {
    props: ['total', 'offset', 'getSearchResult', 'disabledPrev', 'disabledNext'],
    template: `<div  class="pager" v-show="total > 20">
        <button class="previous" :disabled="disabledPrev" v-on:click="getSearchResult('paging','previous')">Previous</button>
        <button class="next" :disabled="disabledNext" v-on:click="getSearchResult('paging','next')">Next</button>
        <span>Showing {{ offset + 1 }} - {{ offset + 20 }} of {{ total | formatNumbers }} results</span>
    </div>`
})

Vue.component('search-top', {
    props: ['searchResult', 'getTrackData', 'getArtistData', 'offset'],
    template: `<transition name="fade"><div  class="top" v-if="searchResult.length > 0">
        <div class="top-container">
            <div v-on:click="toggleTop10()" class="top-item last arrow">{{ offset + 1 }} - {{ offset + 11 }}</div> 
            <!--<div v-for="(track, index) in searchResult" class="top-item" v-bind:class="{ first: index < 10, last: index >= 10 }" >
                <div v-on:click="getTrackData(track.id)" class="ellipsis text">{{ track.name }}</div>
                <img v-on:click="getTrackData(track.id)" :src="track.album.images[1].url" alt="album photo" />
                <div v-on:click="getArtistData('artist', track.artists[0].id)" class="ellipsis text">{{ track.artists[0].name }}</div>
            </div>
            -->
            <template v-for="(track, index) in searchResult">
                <div class="top-item" v-if="index < 10">
                    <div v-on:click="getTrackData(track.id)" class="ellipsis text">{{ track.name }}</div>
                    <img v-on:click="getTrackData(track.id)" :src="track.album.images[1].url" alt="album photo" />
                    <div v-on:click="getArtistData('artist', track.artists[0].id)" class="ellipsis text">{{ track.artists[0].name }}</div>
                </div>
            </template>
            <div v-on:click="toggleTop10()" class="top-item first arrow">{{ offset + 11 }} - {{ offset + 21 }}</div>
        </div>
    </div></transition>`,
    methods: {
        toggleTop10: function () {
            /*
                        if ($(".top-item.first").is(":visible")) {
                            $(".top-item.first").fadeOut(100);
                            $(".top-item.last").delay(100).fadeIn(100);
                        } else {
                            $(".top-item.last").fadeOut(100);
                            $(".top-item.first").delay(100).fadeIn(100);
                        }*/

        }
    }
})

Vue.component('search-result', {
    props: ['searchResult', 'sortResult', 'offset', 'getArtistData', 'getTrackData'],
    template: `<div id="searchresultTable">
    <p v-if="searchResult.length == 0">No search result</p>
    <table v-if="searchResult.length > 0">
        <thead>
            <tr>
                <th v-on:click="sortResult('staticIndex')" class="slim">No.</th>
                <th v-on:click="sortResult('name')">Track</th>
                <th v-on:click="sortResult('artists[0].name')">Artist</th>
                <th v-on:click="sortResult('duration_ms')" class="slim">Duration</th>
                <th v-on:click="sortResult('popularity')" class="slim">Popularity</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="track in searchResult">
                <td class="slim no">{{track.staticIndex + 1 + offset}}</td>
                <td v-on:click="getTrackData(track.id)" class="link">{{track.name}}</td>
                <td><span v-for="artist in track.artists" v-on:click="getArtistData('artist', artist.id)"><span class="link">{{artist.name}}</span>, <span></td>
                <td class="slim">{{track.duration_ms | minutesSeconds }}</td>
                <td class="slim">{{ track.popularity }}%</td>
            </tr>
        <tbody>
    </table>
    </div>`,
})


Vue.component('artist-modal', {
    props: ['artistData', 'closeModal'],
    template: `<transition name="fade"><div  class="dataModal artist">
    <div class="hidePopUp" v-on:click="closeModal">×</div>
    <h2>{{ artistData.name }}</h2>
    <div class="column1">
    <img :src="artistData.images[1].url" alt="artist photo" />
    </div>
    <table>
        <thead>
            <tr>
                <th colspan="2">{{ artistData.name }}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Popularity</td>
                <td>{{ artistData.popularity }}%</td>
            </tr>
            <tr>
                <td>Followers</td>
                <td>{{ artistData.followers.total | formatNumbers}}</td>
            </tr>
            <tr>
                <td>Genres</td>
                <td><span class="genreTag" v-for="genre in artistData.genres">{{ genre }}, </span>
                </td>
            </tr>
            <tr>
                <td>Spotify link</td>
                <td><a :href="artistData.external_urls.spotify">{{ artistData.name }}</a></td>
            </tr>
        </tbody>
    </table>
    </div></transition>`
})

Vue.component('track-modal', {
    props: ['trackData', 'closeModal'],
    template: `<transition name="fade"><div  class="dataModal track">
    <div class="hidePopUp" v-on:click="closeModal">×</div>
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
    </div></transition>`
})

Vue.use(VueRx, Rx);

app = new Vue({
    el: '#appContainer',
    data: {
        loading: false,
        modalOverlay: false,
        modaltrack: false,
        modalartist: false,
        disabledPrev: false,
        disabledNext: false,
        searchResult: {},
        artistData: null,
        trackData: null,
        previous: null,
        next: null,
        total: 0,
        offset: 0
    },
    components: {},
    methods: {
        getSearchResult: function (action, param1) {

            if (action === 'search') {
                if (param1 === '' || param1 === null) return;
                spotifyUrl = 'https://api.spotify.com/v1/search?q=' + param1 + '&type=track&limit=20';
                //sessionStorage.setItem("lastQuery", param1);
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

            this.showSpinner();

            this.$http.get(spotifyUrl).then(response => {
                searchResultTemp = response.body.tracks.items;
                this.searchResult = [];
                for (var i = 0; i < searchResultTemp.length; i++) { // adding a static number to make search result sortable on number
                    tempObj = _.merge(searchResultTemp[i], { staticIndex: i });
                    this.searchResult.push(tempObj);
                }

                this.total = response.body.tracks.total;
                this.offset = response.body.tracks.offset;
                this.previous = response.body.tracks.previous;
                this.next = response.body.tracks.next;
                this.disabledPrev = false;
                this.disabledNext = false;
                if (!this.previous) {
                    this.disabledPrev = true;
                }
                if (!this.next) {
                    this.disabledNext = true;
                }
                console.log('response.body.tracks: ', response.body.tracks.items);
                console.log('this.searchResult: ', this.searchResult);
                this.hideSpinner();
            }, response => {
                console.log('error callback', response);
            });
        },

        sortResult: function (property) {
            if (this.property == property) {
                sortOrderBool = !sortOrderBool;
            } else {
                sortOrderBool = true;
            }
            if (sortOrderBool) {
                sortOrder = 'asc';
            } else {
                sortOrder = 'desc';
            }
            this.property = property;
            this.searchResult = _.orderBy(this.searchResult, property, sortOrder);
        },

        getArtistData: function (type, id) {
            if (type === 'artist') {
                this.showSpinner();
                var spotifyUrl = "https://api.spotify.com/v1/artists/" + id;
                this.$http.get(spotifyUrl).then(response => {
                    this.artistData = response.body;
                    console.log('response.body: ', response.body);
                    this.hideSpinner('modal');
                    this.showModal('artist');
                }, response => {
                    console.log('error callback', response);
                });
                console.log('getArtistData i roden, Type, id ', type, id)
            }
        },

        getTrackData: function (id) {
            for (var i = 0; i < this.searchResult.length; i++) {
                if (this.searchResult[i].id == id) {
                    this.trackData = this.searchResult[i];
                }
            }
            this.hideSpinner('modal');
            this.showModal('track');
        },

        showSpinner: function () {
            this.loading = true;
        },

        hideSpinner: function (type) {
            this.loading = false;
            if (type == "modal") {
                this.modalOverlay = true;
            }
        },

        showModal: function (type) {
            if (type == "track") { this.modaltrack = true };
            if (type == "artist") { this.modalartist = true };
        },

        closeModal: function () {
            this.modalOverlay = false;
            this.modaltrack = false;
            this.modalartist = false;
        }
    }
});