<template>
<div style="text-align: left; flex-grow: 1; display: flex; flex-flow: column">
  <div class="p-3 ms-2" style="font-size: large; display: flex;">
    <ms-input style="flex-grow: 1; align-items: center" v-model="album.title.value" placeholder="Album Title">
      <template v-slot:leading>
        <span v-if="albumId === null">Create</span>
        <span v-else>Edit</span>
        <span>&nbsp;</span>
      </template>
    </ms-input>
    <span>&nbsp;</span>
    <button style="font-size: medium" class="btn btn-success" @click="onSubmit">
      <i class="bi-upload"/>
      <span> Submit</span>
    </button>
  </div>

  <div class="ms-flex-scrollable-container">
    <div class="content-wrapper" style="overflow: hidden scroll">
      <div class="content ms-2">

        <ms-nav-section-header title="Album Artists" icon="person-square" style="font-size: smaller"/>
        <div class="ms-2 me-3" style="display: flex">
          <artist-input style="flex-grow: 1" v-model="album.artists">
            <template v-slot:tailing>
              <button class="ms-2 btn btn-primary btn-sm m-1">
                <span>Use track artists</span>
              </button>
            </template>
          </artist-input>
        </div>

        <ms-nav-section-header title="Cover Arts" icon="images" style="font-size: smaller"/>
        <div class="ms-2 me-3">
          <cover-art-editor ref="coverArtEditor" image-size="100px"/>
        </div>

        <template v-for="(_ ,diskIndex) in album.disks" :key="diskIndex">
          <div style="display: flex; align-items: center; margin-right: 6px;">
            <ms-nav-section-header style="flex-grow: 1; font-size: smaller" :title="`Disk ${diskIndex + 1}`" icon="vinyl-fill"/>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-sm btn-danger" @click="onDeleteDisk(diskIndex)">
                <i class="bi-trash-fill" />
                <span> Delete Disk</span>
              </button>
              <button class="btn btn-sm btn-success" @click="onAddTrack(diskIndex)">
                <i class="bi-plus-lg" />
                <span> Add Track</span>
              </button>
            </div>
          </div>
          <track-input v-for="(track, trackIndex) in album.disks[diskIndex].tracks" :z-index="500" :key="trackIndex"
                       v-model:artists="track.artists"
                       v-model:title="track.title"
                       v-model:recordings="track.recordings"
                       v-model:trackIndex="track.index"
                       style="margin-right: 5px"
          >
            <template v-slot:tailing>
              <div style="margin: 5px" class="btn-group-sm btn-group">
                <button class="btn btn-danger" @click="onDeleteTrack(diskIndex, trackIndex)">
                  <i class="bi-trash-fill" />
                </button>
              </div>
            </template>
          </track-input>
        </template>
      </div>
    </div>
  </div>

  <div class="m-3">
    <div class="btn btn-success" style="width: 100%" @click="onAddDisk">
      <i class="bi-plus-lg"/>
      <span> Add Disk</span>
    </div>
  </div>

 <!-- Modal Area -->

  <ms-modal-base ref="modal" :is-modal-show="modal.isShown"
                 :header="modal.title"
                 :content="modal.content"
                 @close="modal.onNo"
                 @cancel="modal.onNo"
                 @confirm="modal.onOk"
                 footer-type="sao-yes-no"
                 width="50%"
  />

  <ms-modal-base ref="progressModal" :is-modal-show="progressModal.isShow" header="Saving Album"
                 :show-close-button="false" width="50%"
  >
    <div class="m-2" style="display: flex; flex-flow: column">
      <div class="m-2">{{progressModal.progressTitle}}</div>
      <div class="m-2">
        <div class="progress" style="height: 20px">
          <div class="progress-bar progress-bar-striped"
               :class="{'bg-danger' : progressModal.progressState === 'error',
                        'bg-success': progressModal.progressState === 'finished',
                        'progress-bar-animated' : progressModal.progressState === 'normal',
                        }"
               :style="{width: `${progressModal.progress}%`}"
          ></div>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <button style="flex-grow: 1;" class="btn btn-primary" :disabled="!progressModal.footerEnabled"
              @click="progressModal.onClose"
      >
        <i class="bi-x-lg"></i>
        <span> Close</span>
      </button>
    </template>
  </ms-modal-base>
</div>
</template>
<script>
import MSNavSectionHeader from '@/components/MSNavSectionHeader.vue';
import CoverArtEditor from '@/components/CoverArtEditor.vue';
import MSModalBase from '@/components/MSModalBase.vue';
import ArtistInput from '@/components/ArtistInput.vue';
import TrackInput from '@/components/TrackInput.vue';
import MSInput from '@/components/MSInput.vue';
import { fieldValidator, FormField } from '@/common/FormField';
import api from '@/api';
import { mapActions } from 'vuex';

function artistKeyGenerator(artist) {
  return `${artist.artistId || 'null'}:${artist.artistName}`;
}

export default {
  name: 'AdminAlbumEdit',
  components: {
    'ms-nav-section-header': MSNavSectionHeader,
    CoverArtEditor,
    ArtistInput,
    'ms-modal-base': MSModalBase,
    'ms-input': MSInput,
    TrackInput,
  },
  props: {
    albumId: [Number, String],
  },
  data() {
    return {
      album: {
        title: new FormField('New Album', [
          fieldValidator((value) => value, 'Album title should not be empty.'),
        ]),
        artists: [],
        disks: [],
        isLoading: false,
      },

      modal: {
        isShown: false,
        onOk: () => {},
        onNo: () => {
          this.$refs.modal.hideModalBody().then(() => {
            this.modal.isShown = false;
          });
        },
        title: '',
        content: '',
      },

      progressModal: {
        isShow: false,
        progressTitle: '',
        progress: 0,
        footerEnabled: false,
        progressState: 'normal',
        onClose: () => this.$refs.progressModal.hideModalBody().then(() => {
          this.progressModal.isShow = false;
        }),
      },

    };
  },
  mounted() {

  },
  methods: {
    ...mapActions('GlobalModal', ['showGlobalModal', 'hideGlobalModal']),
    onAddDisk() {
      this.album.disks.push({
        tracks: [],
      });
    },

    onDeleteDisk(diskIndex) {
      this.showGlobalModal({
        title: `Delete Disk ${diskIndex + 1}`,
        content: `
Are you sure to delete disk ${diskIndex + 1} ?
<br/> Tracks in this disk will all be deleted. This operation cannot be reverted.
`.trim(),
        onConfirm: () => { this.hideGlobalModal(); this.album.disks.delete(diskIndex); },
        onCancel: this.hideGlobalModal,
        buttonType: 'sao-yes-no',
      });
    },

    onAddTrack(diskIndex) {
      const { tracks } = this.album.disks[diskIndex];
      const { length } = tracks;
      tracks.push({
        title: null,
        index: length + 1,
        recordings: [],
        artists: [],
      });
    },

    onDeleteTrack(diskIndex, trackIndex) {
      const track = this.album.disks[diskIndex].tracks[trackIndex];
      this.showGlobalModal({
        title: `Delete track`,
        content: `
Are you sure to delete ${track.title ? (`track '${track.title}'`) : 'this track'} (at disk ${diskIndex + 1}, index ${trackIndex + 1})?
<br/> Track data will be deleted. This operation cannot be reverted.
`.trim(),
        onConfirm: () => { this.hideGlobalModal(); this.album.disks[diskIndex].tracks.delete(trackIndex); },
        onCancel: this.hideGlobalModal,
        buttonType: 'sao-yes-no',
      });
    },

    getArtistOfTrack(cdIndex, trackIndex) {
      let ref = this.$refs[`cd-${cdIndex}-track-${trackIndex}-artists`];
      // eslint-disable-next-line prefer-destructuring
      if (ref instanceof Array) ref = ref[0];
      // return this.getArtistFromArtistInput(ref);
    },

    /**
     * @typedef { Object } ArtistRef
     * @property { string } artistName
     * @property { number | null } artistId
     */

    /**
     * @typedef { Object } TrackEditorModal
     * @property { number } diskNumber
     * @property { number } trackNumber
     * @property { string } title
     * @property { Array[ArtistRef] } artists
     * @property { Array[{ protocol : string, server: string, url: string }] } recordings
     */

    /**
     * @typedef { Object } CoverArtRef
     * @property { 'file' | 'cover-art' } type
     * @property { File | { id: number, filePath: String} } data
     * @property { string } preview
     */

    /**
     * @typedef { Object } PreProcessInfo
     * @property { String } albumTitle
     * @property { Array[CoverArtRef] } coverArts
     * @property { Array[ArtistRef] } artists
     * @property { Array[TrackEditorModal] } tracks
     */
    async onSubmit() {
      const { coverArtEditor, artistInput } = this.$refs;
      const info = {
        albumTitle: this.album.title.value,
        coverArts: [...coverArtEditor.coverArtModal],
        artists: this.getArtistFromArtistInput(artistInput),
        tracks: this.album.disks
          .mapIndexed((disk, diskIndex) => disk.tracks.mapIndexed((track, trackIndex) => ({
            diskNumber: diskIndex + 1,
            trackNumber: trackIndex + 1,
            title: track.title,
            artists: this.getArtistOfTrack(diskIndex, trackIndex),
            recordings: track.recordings.map((recording) => {
              const [match, protocol, server, location] = recording.url.match(/^(https?):\/\/([\d.A-Za-z_\-@:]+)?\/?(.*)$/);
              if (!match) return null;
              return {
                protocol,
                server,
                location,
              };
            }).filter((item) => item),
          }))).flatMap((item) => item),
      };
      if (!await this.checkArtistExists(info)) return;
      console.log(info);
      const actions = this.buildAlbumSaveActions(info);
      await this.handleAlbumSave(actions);
    },
    /**
     * @param { PreProcessInfo } info
     * @returns {Promise<boolean>}
     */
    async checkArtistExists(info) {
      // confirm artist create
      const nonExistsArtists = [
        ...info.artists.filter((item) => !(item.artistId)),
        ...info.tracks.map((item) => item.artists).flatMap((item) => item).filter((item) => !(item.artistId)),
      ].distinctBy((item) => item.artistName);

      if (nonExistsArtists.isNotEmpty()) {
        const confirmCreate = await new Promise((resolve) => {
          this.modal.title = 'Create non exists artists.';
          this.modal.content = `<span>Those artists are not exists on this server:</span>
                              <br/><span>${nonExistsArtists.map((item) => item.artistName).join(', ')}</span>
                              <br/><span>Would you want to automatically create them?</span>`;

          this.modal.onOk = () => this.$refs.modal.hideModalBody().then(() => {
            this.modal.isShown = false;
            resolve(true);
          });

          this.modal.onNo = () => this.$refs.modal.hideModalBody().then(() => {
            this.modal.isShown = false;
            resolve(false);
          });
          this.modal.isShown = true;
        });

        if (!confirmCreate) return false;
      }

      const ambiguousArtists = [
        ...info.artists.filter((item) => !(item.confirmed)),
        ...info.tracks.map((item) => item.artists).flatten().filter((item) => !(item.confirmed)),
      ];
      if (ambiguousArtists.isNotEmpty()) {
        const confirmCreate = await new Promise((resolve) => {
          this.modal.title = 'Artist ambiguous';
          this.modal.content = `<span>Those artists are ambiguous:</span>
                              <br/><span>${ambiguousArtists.map((item) => item.artistName).join(', ')}</span>
                              <br/><span>Would you want to automatically use first artist in search result?</span>`;

          this.modal.onOk = () => this.$refs.modal.hideModalBody().then(() => {
            this.modal.isShown = false;
            resolve(true);
          });

          this.modal.onNo = () => this.$refs.modal.hideModalBody().then(() => {
            this.modal.isShown = false;
            resolve(false);
          });
          this.modal.isShown = true;
        });

        if (!confirmCreate) return false;
      }

      return true;
    },
    /**
     *
     * @param { PreProcessInfo } info
     * @returns {*[]}
     */
    buildAlbumSaveActions(info) {
      const actions = [];
      const coverArts = [...info.coverArts.map((coverArt) => ({
        id: coverArt.type === 'file' ? null : coverArt.data.id,
        data: coverArt.type === 'file' ? coverArt.data : null,
      }))];

      const album = {
        title: info.albumTitle,
      };

      const artists = [
        ...info.artists,
        ...info.tracks.map((item) => item.artists).flatten(),
      ].distinctBy((item) => artistKeyGenerator(item));

      const tracks = [...info.tracks];
      for (const track of tracks) {
        const artistsKeys = track.artists.map((item) => artistKeyGenerator(item)).distinct();
        track.artists = artistsKeys
          .map((item) => artists.firstMatch((artist) => artistKeyGenerator(artist) === item))
          .filter((item) => item);
      }

      const recordings = tracks.map((track) => track.recordings.map((recording) => ({
        track,
        ...recording,
      }))).flatten();

      const workContext = { album, coverArts, artists, tracks, recordings };

      actions.push(async (progress, title) => {
        const uploadItems = workContext.coverArts.filter((item) => !item.id);
        if (uploadItems.isEmpty()) {
          progress(100);
          return;
        }
        const base = 1 / uploadItems.length;
        let current = 0;
        progress(1);
        for (const uploadItem of uploadItems) {
          title(`Uploading '${uploadItem.data.filename}'.`);
          // eslint-disable-next-line no-loop-func
          const coverArt = await api.coverArt_upload([uploadItem.data], (event) => {
            if (event.lengthComputable) {
              progress(((current + (event.loaded / event.total)) * base) * 100);
            }
          }).then((data) => data.first().coverArt);
          current++;
          progress((current * base) * 100);
          uploadItem.id = coverArt.id;
        }
        progress(100);
      });

      actions.push(async (progress, title) => {
        const newArtists = workContext.artists.filter((artist) => !artist.id);
        if (newArtists.isEmpty()) {
          progress(100);
          return;
        }
        const base = 1 / newArtists.length;
        let current = 0;
        progress(1);
        for (const newArtist of newArtists) {
          title(`Creating Artist '${newArtist.artistName}'.`);
          const artist = await api.artist_create({ name: newArtist.artistName }).then((data) => data.artist);
          newArtist.id = artist.id;
          current++;
          progress((current * base) * 100);
        }
        progress(100);
      });

      actions.push(async (progress, title) => {
        const newAlbum = workContext.album;
        progress(1);
        title(`Creating Album '${newAlbum.title}'.`);
        workContext.album.id = (await api.album_create({
          title: newAlbum.title,
          coverArtIds: workContext.coverArts.map((coverArt) => coverArt.id),
          artistIds: workContext.artists.map((artist) => artist.id),
        }).then((data) => data.album)).id;
        progress(100);
      });

      actions.push(async (progress, title) => {
        const newTracks = workContext.tracks;
        if (newTracks.isEmpty()) {
          progress(100);
          return;
        }
        progress(1);
        const base = 1 / newTracks.length;
        let current = 0;
        for (const track of newTracks) {
          title(`Creating Track '${track.title}'.`);
          track.id = (await api.track_create({
            title: track.title,
            artistIds: track.artists.map((artist) => artist.id),
            albumId: workContext.album.id,
            diskNumber: track.diskNumber,
            trackNumber: track.trackNumber,
          }).then((data) => data.track)).id;
          current++;
          progress((current * base) * 100);
        }
        progress(100);
      });

      actions.push(async (progress, title) => {
        const newRecordings = workContext.recordings;
        if (newRecordings.isEmpty()) {
          progress(100);
          return;
        }
        progress(1);
        const base = 1 / newRecordings;
        let current = 0;
        for (const recording of newRecordings) {
          title(`Append recording to '${recording.track.title}'.`);
          await api.recording_create({
            trackId: recording.track.id,
            protocol: recording.protocol,
            server: recording.server,
            location: recording.location,
          });
          current++;
          progress((current * base) * 100);
        }
      });

      return actions;
    },
    async handleAlbumSave(actions) {
      const { progressModal } = this;
      let i = 0;
      function reportProgress(value) {
        const base = (1 / actions.length);
        const progress = ((i + (value / 100)) * base) * 100;
        console.log(progress);
        progressModal.progress = progress;
      }
      function reportTitle(value) {
        progressModal.progressTitle = value;
      }

      progressModal.isShow = true;
      progressModal.progressState = 'normal';
      let error = false;
      for (; i < actions.length; i++) {
        try {
          await actions[i](reportProgress, reportTitle);
        } catch (e) {
          progressModal.progressState = 'error';
          progressModal.progressTitle = `Error: ${e}`;
          error = true;
          break;
        }
      }

      if (!error) {
        progressModal.progressState = 'finished';
        progressModal.progressTitle = 'Finished';
      }
      progressModal.footerEnabled = true;
    },
  },
};
</script>

<style scoped>

</style>
