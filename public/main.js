(function() {

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }

    var playlistList = document.getElementById('user-playlists');

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
      alert('There was an error during the authentication');
    } else {
      if (access_token) {
        $.ajax({
          //Récup des infos du profil connecté, dont l'id
            url: 'https://api.spotify.com/v1/me',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              userProfilePlaceholder.innerHTML = userProfileTemplate(response);

              console.log(response)

              $('#login').hide();
              $('#loggedin').show();
            }
        }).done(function(data) {
          //Récup des playlists du profil connecté grâce à l'id de ce dernier
          $.ajax({
            url: 'https://api.spotify.com/v1/users/'+data.id+'/playlists',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
              //On parcourt les playlists
              for (let playlist of response.items) {
                  let containerPlaylist = document.createElement("div");
                  containerPlaylist.classList.add('m-2', 'pe-2', 'border', 'flex-fill');
                  document.getElementById('user-playlists').appendChild(containerPlaylist);

                  let btnPlaylist = document.createElement("a");
                  let idPlaylist = playlist.id
                  let namePlaylist = playlist.name
                  btnPlaylist.setAttribute("id", idPlaylist);
                  btnPlaylist.appendChild(document.createTextNode(namePlaylist));
                $.ajax({
                  //Récup du cover de la playlist 
                    url: 'https://api.spotify.com/v1/playlists/'+playlist.id+'/images',
                    headers: {
                      'Authorization': 'Bearer ' + access_token
                    },
                    success: function(resp) {

                      let coverPlaylist = document.createElement("img");
                      coverPlaylist.setAttribute("width", "75");
                      coverPlaylist.setAttribute("height", "75");
                      coverPlaylist.classList.add('me-2');
                      if(JSON.parse(resp)[0] != null) {
                        coverPlaylist.setAttribute("src", JSON.parse(resp)[0].url);
                      }
                      containerPlaylist.appendChild(coverPlaylist);
                      containerPlaylist.appendChild(btnPlaylist);
                    }
                }).done(function(data) { 
                  $.ajax({
                  //Récup des musiques présente dans la playlist (limité à 100 par API Spotify)
                    url: 'https://api.spotify.com/v1/playlists/'+playlist.id+'/tracks',
                    headers: {
                      'Authorization': 'Bearer ' + access_token
                    },
                    success: function(resp) {
                      let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resp));
                      let btnPlaylist = document.getElementById(idPlaylist);
                      btnPlaylist.setAttribute("href", dataStr);
                      btnPlaylist.setAttribute("target", "_blank");
                      btnPlaylist.setAttribute("download", namePlaylist+".json");
                    }
                })
                })
              }
            }
        })
        });;

        
      } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
      }

      // document.getElementById('obtain-new-token').addEventListener('click', function() {
      //   $.ajax({
      //     url: '/refresh_token',
      //     data: {
      //       'refresh_token': refresh_token
      //     }
      //   }).done(function(data) {
      //     access_token = data.access_token;
      //     oauthPlaceholder.innerHTML = oauthTemplate({
      //       access_token: access_token,
      //       refresh_token: refresh_token
      //     });
      //   });
      // }, false);
    }
  })();