Vue.filter('minutesSeconds', function(value) {
    if (!value) return '';
    minutes = Math.floor(value / (1000 * 60));
    seconds = ('00' + Math.floor((value / 1000) % 60)).slice(-2);
    return minutes + ':' + seconds;
})

Vue.filter('formatNumbers', function(value) {
    if (!value) return '';
    filteredValue = value.toLocaleString();
    return filteredValue;
})

Vue.component('search-box', {
    props: ['getSearchResult'],
    template: `
    <div id="searchBox">
        <input id="query" type="text" v-model="searchquery" :value="searchquery" autofocus>
        <button id="searchButton" v-on:click="getSearchResult('search', searchquery)">Search</button>
        <div id="searchChoiceContainer">
            <input v-on:change="getSearchResult('search', searchquery, searchType)" v-model="searchType" name="searchT" type="radio" value="tracks" id="srchTrck">
            <label for="srchTrck">Tracks</label> 
            <input v-on:change="getSearchResult('search', searchquery, searchType)" v-model="searchType" name="searchT" type="radio" value="artists"  id="srchArt">
            <label for="srchArt">Artists</label>
        </div>    
    </div>`,
    data: function() {
        if (sessionStorage.getItem("searchtype")) {
            searchType = sessionStorage.getItem("searchtype");
        } else {
            searchType = "tracks";
        }
        return {
            searchType: searchType
        }
    },
    created: function() {
        this.searchquery = sessionStorage.getItem("lastQuery");
    },
    subscriptions: function() {
        return {
            // Dette er en observable som fyrer på keyup fra #query-elementet.
            inputValue: this.$fromDOMEvent('#query', 'keyup').pluck('target', 'value')
                .debounce(500) // Vent til der ikke er tastet i 500ms
                .distinctUntilChanged() // Fyr kun hvis værdien har ændret sig
                .filter(query => query.length > 0) // Filtrer tomme værdier fra.
                .startWith(sessionStorage.getItem("lastQuery")) // Start med søgningen fra session.storage
                .do(query => this.getSearchResult('search', query, this.searchType)) // Fyr søgningen.
        }
    }
})

Vue.component('search-pager', {
    props: ['getSearchResult', 'searchMetaData'],
    template: `
    <div class="pager">
        <template  v-if="searchMetaData.total > 20">
            <button class="previous" :disabled="searchMetaData.disabledPrev" v-on:click="getSearchResult('paging','previous')">Previous</button>
            <button class="next" :disabled="searchMetaData.disabledNext" v-on:click="getSearchResult('paging','next')">Next</button>
        </template>
        <span  v-if="searchMetaData.total > 0">Showing {{ searchMetaData.offset + 1 }} - 
            <span v-if="searchMetaData.offset + 20 < searchMetaData.total" >{{ searchMetaData.offset + 20 }}</span>
            <span v-else>{{ searchMetaData.total }}</span>
            of {{ searchMetaData.total | formatNumbers }} results
        </span>
    </div>`
})

Vue.component('search-top', {
    props: ['searchResult', 'searchMetaData', 'getTrackData', 'getArtistData', 'searchType', 'visualPager', 'showFirst'],
    template: `
    <div>
        <div  class="top" v-if="searchResult.length > 0">
            <div class="top-container">
                <div v-on:click="visualPager('scrolling')" v-if="!showFirst" class="top-item first arrow">{{ searchMetaData.offset + 1 }} - {{ searchMetaData.offset + 10 }}</div> 
                <div v-on:click="visualPager('paging','previous')" v-if="showFirst && searchMetaData.offset - 1 > 0 " class="top-item first arrow">{{ searchMetaData.offset - 9 }} - {{ searchMetaData.offset }}</div> 
                <template  v-if="searchType == 'tracks'" v-for="(item, index) in searchResult">
                    <transition name="fadeSlide">
                        <div class="top-item" v-if="showFirst && index < 10">
                            <div v-on:click="getTrackData(item.id)" class="ellipsis text">{{ item.name }}</div>
                            <img v-on:click="getTrackData(item.id)" v-if="item.album" :src="item.album.images[1].url" alt="Album photo" />
                            <div v-on:click="getArtistData('artist', item.artists[0].id)" v-if="item.artists" class="ellipsis text">{{ item.artists[0].name }}</div>
                        </div>
                        <div class="top-item" v-if="!showFirst && index >= 10">
                            <div v-on:click="getTrackData(item.id)" class="ellipsis text">{{ item.name }}</div>
                            <img v-on:click="getTrackData(item.id)" v-if="item.album" :src="item.album.images[1].url" alt="Album photo" />
                            <div v-on:click="getArtistData('artist', item.artists[0].id)" v-if="item.artists" class="ellipsis text">{{ item.artists[0].name }}</div>
                        </div>
                    </transition>    
                </template>
                <template  v-if="searchType == 'artists'" v-for="(item, index) in searchResult">
                    <transition name="fadeSlide">
                        <div v-on:click="getArtistData('artist', item.id)" class="top-item" v-if="showFirst && index < 10">
                            <div class="ellipsis text">{{ item.name }}</div>
                            <img v-if="item.images && item.images[1]" :src="item.images[1].url" alt="Artist photo" />
                            <div v-else class='noimage'></div>
                        </div>
                        <div v-on:click="getArtistData('artist', item.id)" class="top-item" v-if="!showFirst && index >= 10">
                            <div class="ellipsis text">{{ item.name }}</div>
                            <img v-if="item.images && item.images[1]" :src="item.images[1].url" alt="Artist photo" />
                            <div v-else class='noimage'></div>
                        </div>
                    </transition>    
                </template>
                <div v-on:click="visualPager('scrolling')" v-if="showFirst && searchMetaData.offset + 10 < searchMetaData.total" class="top-item last arrow">{{ searchMetaData.offset + 11 }} - {{ searchMetaData.offset + 21 }}</div>
                <div v-on:click="visualPager('paging','next')" v-if="!showFirst && searchMetaData.offset + 20 < searchMetaData.total" class="top-item last arrow">{{ searchMetaData.offset + 21 }} - {{ searchMetaData.offset + 31 }}</div>
            </div>
        </div>
    </div>  
    `,
    methods: {
        someFunction: function() {

        }
    }
})

Vue.component('search-result', {
    props: ['searchResult', 'searchMetaData', 'sortResult', 'getArtistData', 'getTrackData', 'searchType'],
    template: `
    <div>
        <p v-if="searchResult.length == 0">Your search for: <strong> {{searchMetaData.query}}</strong> returned no {{searchType}}!</p>
        <table v-if="searchResult.length > 0 && searchType =='tracks'">
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
                <tr v-for="item in searchResult">
                    <td class="slim no">{{item.staticIndex + 1 + searchMetaData.offset}}</td>
                    <td v-on:click="getTrackData(item.id)" class="link">{{item.name}}</td>
                    <td><span v-for="artist in item.artists" v-on:click="getArtistData('artist', artist.id)"><span class="link">{{artist.name}}</span>, </span></td>
                    <td class="slim">{{item.duration_ms | minutesSeconds }}</td>
                    <td class="slim">{{ item.popularity }}%</td>
                </tr>
            </tbody>
        </table>
        <table v-if="searchResult.length > 0 && searchType =='artists'">
            <thead>
                <tr>
                    <th v-on:click="sortResult('staticIndex')" class="slim">No.</th>
                    <th>Photo</th>
                    <th v-on:click="sortResult('name')">Name</th>
                    <th v-on:click="sortResult('genres[0]')">Genres</th>
                    <th v-on:click="sortResult('followers.total')" class="slim">Followers</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in searchResult">
                    <td class="slim no">{{item.staticIndex + 1 + searchMetaData.offset}}</td>
                    <td v-on:click="getArtistData('artist', item.id)" class="photo"><img v-if="item.images && item.images[1]" :src="item.images[1].url" alt="Artist photo" /></td>
                    <td v-on:click="getArtistData('artist', item.id)" class="link">{{item.name}}</td>
                    <td class="genre"><span class="genreTag" v-for="genre in item.genres">{{ genre }}, </span></td>
                    <td class="slim no"><span v-if="item.followers">{{ item.followers.total | formatNumbers }}</span></td>
                </tr>
            </tbody>
        </table>
    </div>`,
})


Vue.component('artist-modal', {
    props: ['artistData', 'closeModal'],
    template: `
    <transition name="fade">
        <div  class="dataModal artist">
            <div class="hidePopUp" v-on:click="closeModal">×</div>
            <h2>{{ artistData.name }}</h2>
            <div class="column1">
                <img v-if="artistData.images[0]" :src="artistData.images[0].url" alt="artist photo" />
                <div v-else>
                    <p>No spotify image available</p>
                    <div class='noimage'></div>
                </div>
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

            <h3>Top {{ artistData.tracks.length }} tracks</h3>
            <table class="topTracks">
                <thead>
                    <tr>
                        <th class="slim no">No.</th>
                        <th>Name</th>
                        <th>Album</th>
                        <th class="slim">Popularity</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(track, index) in artistData.tracks">
                        <td class="slim no">{{index + 1}}</td>
                        <td>{{track.name}}</td>
                        <td>{{track.album.name}}</td>
                        <td class="slim">{{track.popularity}}%</td>
                    </tr>
                </tbody>
            </table>

        </div>
    </transition>`
})

Vue.component('track-modal', {
    props: ['trackData', 'closeModal'],
    template: `
    <transition name="fade">
        <div  class="dataModal track">
        <div class="hidePopUp" v-on:click="closeModal">×</div>
            <h2>{{ trackData.name }}</h2>
            <div class="column1">
                <img v-if="trackData.album.images[1]" :src="trackData.album.images[1].url" alt="album photo" />
                <p>Artists: <span v-for="artist in trackData.artists">{{ artist.name }},</span> </p>           
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
        </div>
    </transition>`
})

Vue.use(VueRx, Rx);

app = new Vue({
    el: '#appContainer',
    data: {
        loading: false,
        modalOverlay: false,
        modaltrack: false,
        modalartist: false,
        showFirst: true,
        searchResult: {},
        searchMetaData: {},
        artistData: null,
        trackData: null,
        searchType: 'tracks'
    },
    components: {},
    methods: {
        getSearchResult: function(action, param1, param2) {
            //this.showFirst = false;
            this.showFirst = true;
            if (action === 'search') {
                if (param1 === '' || param1 === null) return;
                if (param2) {
                    this.searchType = param2;
                    sessionStorage.setItem("searchtype", this.searchType);
                }
                if (this.searchType == 'tracks') {
                    spotifyUrl = 'https://api.spotify.com/v1/search?q=' + param1 + '&type=track&limit=20';
                } else {
                    spotifyUrl = 'https://api.spotify.com/v1/search?q=' + param1 + '&type=artist&limit=20';
                }
                sessionStorage.setItem("lastQuery", param1);
            }
            if (action === 'paging') {
                if (param1 === 'next') {
                    if (!this.searchMetaData.next) { // Checking if there's more results
                        return;
                    }
                    spotifyUrl = this.searchMetaData.next;
                }
                if (param1 === 'previous') {
                    if (!this.searchMetaData.previous) { // Checking if this is the first result
                        return;
                    }
                    spotifyUrl = this.searchMetaData.previous;
                }
            }

            this.showSpinner();

            this.$http.get(spotifyUrl).then(response => {

                /* Search result */
                if (this.searchType == 'tracks') {
                    searchResultTemp = response.body.tracks;
                } else {
                    searchResultTemp = response.body.artists;
                }
                this.searchResult = [];
                for (var i = 0; i < searchResultTemp.items.length; i++) { // adding a static number to make search result sortable on number
                    tempObj = _.merge(searchResultTemp.items[i], { staticIndex: i });
                    this.searchResult.push(tempObj);
                }

                /* Search result meta data object */
                disabledPrev = false;
                disabledNext = false;
                if (!searchResultTemp.previous) disabledPrev = true;
                if (!searchResultTemp.next) disabledNext = true;

                this.searchMetaData = {
                    total: searchResultTemp.total,
                    query: param1,
                    offset: searchResultTemp.offset,
                    previous: searchResultTemp.previous,
                    next: searchResultTemp.next,
                    disabledPrev: disabledPrev,
                    disabledNext: disabledNext
                }

                //console.log('response.body: ', response.body);
                //console.log('searchMetaData: ', this.searchMetaData);
                this.hideSpinner();
            }, response => {
                console.log('error callback', response);
            });
        },

        sortResult: function(property) {
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

        getArtistData: function(type, id) {
            if (type === 'artist') {
                this.showSpinner();
                var spotifyUrl = "https://api.spotify.com/v1/artists/" + id;
                var spotifyUrlTop = "https://api.spotify.com/v1/artists/" + id + "/top-tracks?country=dk";
                this.$http.get(spotifyUrl).then(response => {
                    this.artistData = response.body;
                    this.$http.get(spotifyUrlTop).then(response => {
                        var artistTopTracks = response.body;
                        console.log('artistTopTracks ', artistTopTracks);
                        this.artistData = _.merge(this.artistData, artistTopTracks);
                        this.hideSpinner('modal');
                        this.showModal('artist');
                    }, response => {
                        console.log('error callback2', response);
                    });
                }, response => {
                    console.log('error callback1', response);
                });
            }
        },

        getTrackData: function(id) {
            for (var i = 0; i < this.searchResult.length; i++) {
                if (this.searchResult[i].id == id) {
                    this.trackData = this.searchResult[i];
                }
            }
            this.hideSpinner('modal');
            this.showModal('track');
        },

        visualPager: function(action, direction) {
            this.showFirst = !this.showFirst
            if (action == 'paging') {
                if (direction == 'next') {
                    this.getSearchResult('paging', 'next');
                } else {
                    this.getSearchResult('paging', 'previous');
                    this.showFirst = false;
                }
            }
            console.log(this.showFirst)
        },

        showSpinner: function() {
            this.loading = true;
        },

        hideSpinner: function(type) {
            this.loading = false;
            if (type == "modal") {
                this.modalOverlay = true;
            }
        },

        showModal: function(type) {
            if (type == "track") { this.modaltrack = true };
            if (type == "artist") { this.modalartist = true };
        },

        closeModal: function() {
            this.modalOverlay = false;
            this.modaltrack = false;
            this.modalartist = false;
        }
    }
});