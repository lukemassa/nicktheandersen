(function() {

    $(() => {
        Vue.use(VueRouter);
        const router = new VueRouter({
           routes : [
               { path: '/', component: Home },
               { path: '/about', component: About }
           ]
        });
        app = new Vue({router: router,
			el:"#app"})
    });
    Array.prototype.shuffle = function() {
      var i = this.length, j, temp;
      if ( i == 0 ) return this;
      while ( --i ) {
         j = Math.floor( Math.random() * ( i + 1 ) );
         temp = this[i];
         this[i] = this[j];
         this[j] = temp;
      }
      return this;
    }


    Vue.component('nta-header',{
        template:`
        <div class='title'>
        nick andersen
        </div>
        `
    });
    var About = Vue.component('nta-aboutme', {
		template: `<div>
        <br>
        <br>
        <p>Nick Andersen is an audio producer living in Cambridge, MA.</p>
    
        <p>He is the senior producer of <a href="https://www.ministryofideas.org/">
        Ministry of Ideas</a>, a founding member of the <a href="https://www.hubspokeaudio.org/">Hub & Spoke Podcast Collective</a>, for which he also a board member.</p>

        <p>Previously, he was the first ever archives producer for <a href="https://www.npr.org/programs/fresh-air/"> NPR's Fresh Air with Terry Gross and Tonya Mosley</a>, producer of the Webby and Signal award-winning <a href="https://www.pbs.org/wgbh/masterpiece/podcasts/">MASTERPIECE Studio podcast</a> for the long-running PBS telelvision drama, MASTERPIECE, and a producer for the WBUR and NPR talk show, <a href="http://www.wbur.org/onpoint">On Point Radio</a>.</p>
        <p>A 2012 graduate of the University of North Carolina at Chapel Hill, he is a proud native of the Metro Detroit region.</p>
        <p>You can read his undergraduate thesis on mid-20th Century American opera history, "Too Real To Be Funny," <a href="/img/AndersenThesisFinal.pdf">here</a>.</p>
        <p>Contact him at nkandersen AT gmail DOT com.</p>
        <p>You can read his resume <a href="/img/NickAndersen_CV2025.pdf">here</a>.</p>
        <br>
        <router-link class='nav' to="/">back</router-link>
		</div>`
	})
	
    var Home = Vue.component('nta-home', {
        template: `<div>
        <div class="middlestuff">
        <div class='icons'><router-link class='nav' to="/about">about</router-link></p></div>
        <div class='home'>
        <div v-for="i in images"><img class='instaimg' v-bind:style="i['style']" v-bind:src="i['url']"></div>
        </div>
		<div class="icons">
        <p align='right'>
		<a href="https://twitter.com/nicktheandersen" target="_blank" ><img class="theicons" title="Twitter" src="https://socialmediawidgets.files.wordpress.com/2014/03/01_twitter1.png" alt="Twitter" width="35" height="35" scale="0"></a>
		<a href="https://instagram.com/nicktheandersen" target="_blank"><img class="theicons" title="Instagram" src="https://socialmediawidgets.files.wordpress.com/2014/03/10_instagram1.png" alt="Instagram" width="35" height="35" scale="0"></a>
		<a href="https://www.linkedin.com/in/nick-andersen-61661963" target="_blank"><img class="theicons" title="Instagram" src="https://socialmediawidgets.files.wordpress.com/2014/03/07_linkedin1.png" alt="Linkedin" width="35" height="35" scale="0"></a>
        </p>
		</div>
        </div>
        </div>`,
        data: function() {
            return {
                images: [],
                desired_images: this.determine_desired_images(),
                allowed_deviation_from_square: 0.01,
                wait_for_backfill: 1000,
            }
        },
        methods: {
            determine_desired_images: function() {
                // Probably better place/way to do this
                if (screen.width < 400) {
                    return 4;
                }
                return 10;
            },
            is_approximately_square: function(x, y) {
                var ratio = x / y;
                var deviation = Math.abs(1 - ratio);
                return deviation < this.allowed_deviation_from_square;
            },
            image_object: function(url) {
                var style = 'width:' + 100 / this.desired_images + '%';
                return {"url":url, "style":style}
            },
            update_images: function() {
                jQuery.ajax('https://instagram.com/nicktheandersen').done((response) => {
                    response = response.replace(/\n/g,' ');
                    // Fingers crossed that instagram doesn't have some XSS bullshit in here...
                    var match = response.match(/window._sharedData = (.*?);<\/script>/);
                    var data = JSON.parse(match[1]);
                    // Oh yeah, there's *no* way this will ever break
                    // I apologize
                    var edges = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;
					edges.shuffle();
					edges.forEach( (edge) => {
                        if (this.images.length < this.desired_images ) {
                            var height = edge.node.dimensions.height;
                            var width = edge.node.dimensions.width;

                            if (this.is_approximately_square(height, width) ) {
                                this.images.push(this.image_object(edge.node.display_url))
                            } else {
                                console.log("Did not use " + edge.node.display_url + " (" + height + " x " + width + ")");
                            }

                        }
                    });
                })
            },
            backfill_images: function() {
                var default_nums = [];
                for (var i=0; i<this.desired_images; i++)
                    default_nums.push(i);
                default_nums.shuffle();

                default_nums.forEach( (i) => {
                    if (this.images.length < this.desired_images) {
                        this.images.push(this.image_object("/img/fallback_" + i + ".jpg"))
                    }
                });

            }
        },
        mounted: function() {
            this.update_images();

			// After 3 seconds, backfill missing images
            // This is in case insta is down, or, more likely, have changed
            // the format of their page such that the parsing of urls breaks.
            setTimeout(function() {
                    this.backfill_images();
            }.bind(this), this.wait_for_backfill);
            //this.update_images();
        }
    })



})();
