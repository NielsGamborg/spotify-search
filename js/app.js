Vue.component('search-box', {
    props: ['getSearchResult'],
    template: `<div id="searchBox">
    <input  v-on:keyup.enter="callSearch(searchquery)" id="query" v-model="searchquery" type="text">
    <button id="searchButton" v-on:click="callSearch(searchquery)" >Search</button>
    </div>`,
    data: function() {
        return { searchquery: '' }
    },
    methods: {
        callSearch: function(searchquery) {
            this.getSearchResult('search', searchquery);
        }
    }
})

Vue.component('search-result', {
    props: ['searchResult', 'offset'],
    template: `<div id="searchresultTable">
    <p v-if="searchResult.length == 0">No search result</p>
    <table v-if="searchResult.length>0">
    <thead>
    <tr>
    <th>No.</th><th>Track</th><th>Artist</th><th>Popularity</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(track, index) in searchResult">
    <td>{{index + 1 + offset}}</td>
    <td>{{track.name}}</td>
    <td><span v-for="artist in track.artists">{{artist.name}}, <span></td>
    <td>{{track.popularity}}%</td>
    </tr>
    <tbody>
    </table>
    </div>`,
    data: function() {
        return { searchquery: '' }
    },
    methods: {},
})

Vue.component('search-pager', {
    props: ['total', 'offset', 'getSearchResult'],
    template: `<div  class="pager" v-show="total > 20">
    <button class="previous" v-on:click="callSearch('previous')">Previous</button>
    <button class="next" v-on:click="callSearch('next')">Next</button>
    <span>Showing {{ offset + 1 }} - {{ offset + 20 }} of {{ total }} results</span>
    </div>`,
    methods: {
        callSearch: function(direction) {
            this.getSearchResult('paging', direction);
        }
    }
})

app = new Vue({
    el: '#main',
    data: {
        searchResult: {},
        previous: null,
        next: null,
        total: 0,
        offset: 0
    },
    components: {},
    methods: {
        getSearchResult: function(action, param1) {

            if (action === 'search') {
                spotifyUrl = 'https://api.spotify.com/v1/search?q=' + param1 + '&type=track'
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
                console.log('response.body.tracks: ', response.body.tracks);
                $('#spinner,#overlay').hide();
            }, response => {
                console.log('error callback', response);
            });

        },
        somefunction: function() {
            console.log('some function called');
        },
        parentmethod: function(passedquery) {
            console.log('passedquery', passedquery)
        }
    }
});