import Spotify from 'spotify-web-api-js';

const spotify = new Spotify();

export default class relatedArtists {
  constructor(artistName, relatedArtistObject){
    // console.log('artistName', artistName);
    this.render(artistName, relatedArtistObject);
  }

  render(artistName, relatedArtistObject) {
    this.populateChart(artistName, relatedArtistObject);
    this.populateAudioSources(relatedArtistObject);
    this.appendListenersToArtists();

    // enables 30-second preview when hovering over thumbnail
    const thumbnails = Array.from(document.querySelectorAll('.related-artist-thumbnail'));
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('mouseover', this.togglePreview);
      thumbnail.addEventListener('mouseout', this.togglePreview);
    });
  }

  populateChart(artistName, relatedArtistObject) {
    const relatedArtistsChart = document.querySelector(".related-artists-chart");

    const h1 = document.createElement("h1");
    h1.textContent = `Related to ${artistName}`;
    relatedArtistsChart.appendChild(h1);
    relatedArtistObject.artists.forEach((artist, idx) => {
      const div = document.createElement("div");
      div.className = 'related-artists-item-div';
      relatedArtistsChart.appendChild(div);

      const img = document.createElement("img");
      img.className = 'related-artist-thumbnail';
      img.src = this.selectImageThumbnail(artist.images);
      img.setAttribute('data-artistId', artist.id);
      div.appendChild(img);

      const span = document.createElement("span");
      span.textContent = artist.name;
      span.className = 'related-artist-names';
      span.setAttribute('data-artistId', artist.id);
      div.appendChild(span);
    });
  }

  // Selects the first image whose height/width ratio is 1/1.
  selectImageThumbnail(images) {
    let imageRatios = [];
    for(let i = 0; i<images.length; i++ ) {
      if (images[i].height === images[i].width) {
        return images[i].url;
      } else {
        return images[0].url;
      }
    }
  }

  // parse related artists object by iterating over each related
  // artist, fetching their top tracks, and appending audio tags for
  // each related artist's top song
  populateAudioSources(relatedArtistObject) {
    let relatedArtistsIds = [];
    relatedArtistObject.artists.forEach(relatedArtist => {
      relatedArtistsIds.push(relatedArtist.id);
    });
    relatedArtistsIds.forEach(id => {
      const previews = document.querySelector('.previews');
      // console.log('previews', previews);
      let audio = document.createElement('audio');
      spotify.getArtistTopTracks(id, 'US')
      .then(topTracksResp => {
        // console.log('topTracksResp', topTracksResp);
        audio.setAttribute('data-artistId', id);
        audio.src = topTracksResp.tracks[0].preview_url;
        previews.appendChild(audio);
      });
    });
  }

  togglePreview(e) {
    const artistId = e.target.dataset.artistid;
    const audio = document.querySelector(`audio[data-artistid="${artistId}"]`);
    if (!audio) return;
    audio.currentTime = 0;
    if(!!audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }

  fetchNewArtist(e) {
    const name = e.target.textContent;
    const id = e.target.dataset.artistid;

    console.log(`my name is ${name}`);
    console.log(`my id is ${id}`);

    let relatedArtistsChart = document.querySelector(".related-artists-chart");
    relatedArtistsChart.innerHTML = '<div class="previews"></div>';

    spotify.getArtistRelatedArtists(id)
      .then(artistsResp => {
        console.log(artistsResp);
        new relatedArtists(name, artistsResp);
      });
  }

  appendListenersToArtists() {
    const allRelatedArtists = document.querySelectorAll('.related-artist-names');
    allRelatedArtists.forEach(artist => {
      artist.addEventListener('click', this.fetchNewArtist);
    });
  }
}
