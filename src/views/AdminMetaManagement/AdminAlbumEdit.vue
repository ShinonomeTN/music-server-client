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
          <artist-input style="flex-grow: 1" v-model="album.artists" popup-position="bottom">
            <template v-slot:tailing>
              <button class="ms-2 btn btn-primary btn-sm m-1" @click="fillTrackArtists">
                <span>Use track artists</span>
              </button>
            </template>
          </artist-input>
        </div>

        <ms-nav-section-header title="Cover Arts" icon="images" style="font-size: smaller"/>
        <div class="ms-2 me-3">
          <cover-art-editor v-model="album.coverArts" image-size="100px"/>
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

function buildArtistKey(artist) {
  return `${artist.id || 'null'}${artist.name}`;
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
        coverArts: [],
        artists: [],
        disks: [],
        isLoading: false,
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
  methods: {
    ...mapActions('GlobalModal', ['showGlobalModal', 'hideGlobalModal']),
    async fillTrackArtists() {
      const artists = this.album.disks.flatMap((disk) => disk.tracks)
        .flatMap((track) => track.artists)
        .distinctBy((artist) => buildArtistKey(artist));

      if (this.album.artists.isNotEmpty()) {
        const result = await new Promise((resolve) => {
          this.showGlobalModal({
            title: 'Replace artists with tracks\' artists',
            content: `
          Would you want to use those artists as album artists? <br/>
          ${artists.map((artist) => artist.name).join(' ,')}
          `,
            onCancel: () => this.hideGlobalModal().then(() => resolve(false)),
            onConfirm: () => this.hideGlobalModal().then(() => resolve(true)),
            showCloseButton: false,
            buttonType: 'sao-yes-no',
          });
        });

        if (!result) return;
      }

      this.album.artists.clear();
      this.album.artists.addAll(artists);
    },
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
        title: 'Delete track',
        content: `
Are you sure to delete ${track.title ? (`track '${track.title}'`) : 'this track'} (at disk ${diskIndex + 1}, index ${track.index})?
<br/> Track data will be deleted. This operation cannot be reverted.
`.trim(),
        onConfirm: () => { this.hideGlobalModal(); this.album.disks[diskIndex].tracks.delete(trackIndex); },
        onCancel: this.hideGlobalModal,
        buttonType: 'sao-yes-no',
      });
    },

    async onSubmit() {
      const { album } = this;
      const artists = [
        ...album.artists,
        ...album.disks.flatMap((disk) => disk.tracks).map((track) => track.artists).flatten(),
      ].distinctBy((item) => `${item.id || 'null'}:${item.name}`);

      if (!await this.onSubmit_checkArtistAmbiguous(artists)) return;
      if (!await this.onSubmit_checkArtistAutoCreate(artists)) return;

      const actions = [];

      // Create artists
      actions.push(async (progress, title) => {
        title('Preparing artists.');
        progress(1);
        const nonExists = artists.filter((artist) => artist.id === null);
        const base = 1 / nonExists.length;
        let count = 0;
        for (const artist of nonExists) {
          title(`Creating Artist ${artist.name}`);
          const created = await api.artist_create({ name: artist.name }).then((data) => data.artist);
          artist.id = created.id;
          count++;
          progress(count * base * 100);
        }
        progress(100);
      });

      // Create cover arts
      actions.push(async (progress, title) => {
        const coverArts = album.coverArts.filter((coverArt) => (coverArt.type === 'file'));
        if (coverArts.isEmpty()) {
          progress(100);
          return;
        }
        title('Uploading cover art');
        progress(1);
        const base = 1 / coverArts.length;
        let count = 0;
        for (const coverArt of coverArts) {
          coverArt.id = (await api.coverArt_upload([coverArt.data], (event) => {
            if (event.lengthComputable) {
              progress(((count + (event.loaded / event.total)) * base) * 100);
            }
          }).then((data) => data.first().coverArt)).id;
          count++;
          progress(count * base * 100);
        }
      });

      // Create album
      actions.push(async (progress, title) => {
        title(`Creating album '${album.title.value}'`);
        progress(1);
        album.id = (await api.album_create({
          title: album.title.value,
          artistIds: artists.mapNotNull((artist) => artist.id),
          coverArtIds: album.coverArts.mapNotNull((coverArt) => ((coverArt.type === 'file') ? coverArt.id : coverArt.data.id)),
        }).then((data) => data.album)).id;
        progress(100);
      });

      // Create tracks
      actions.push(async (progress, title) => {
        const tracks = album.disks.mapIndexed((disk, index) => disk.tracks.map((track) => ({
          track,
          diskId: index + 1,
        }))).flatten();

        if (tracks.isEmpty()) { progress(100); return; }
        title('Creating tracks');
        progress(1);
        const base = 1 / tracks.length;
        let count = 0;
        for (const { track, diskId } of tracks) {
          title(`Creating track '${track.title}'`);
          track.id = (await api.track_create({
            title: track.title,
            artistIds: track.artists
              .mapNotNull((artist) => artists.firstMatch((exists) => buildArtistKey(artist) === buildArtistKey(exists)))
              .map((artist) => artist.id),
            diskNumber: diskId,
            trackNumber: track.index,
            albumId: album.id,
          }).then((data) => data.track)).id;
          count++;
          progress(count * base * 100);
        }
      });

      // Create recordings
      actions.push(async (progress, title) => {
        const recordings = album.disks.flatMap((disk) => disk.tracks)
          .flatMap((track) => track.recordings.map((recording) => ({
            recording,
            track,
          })));

        if (recordings.isEmpty()) { progress(100); return; }

        title('Appending Recording to tracks.');
        progress(1);
        const base = 1 / recordings.length;
        let count = 0;
        for (const { recording, track } of recordings) {
          title(`Appending Recording to track '${track.title}'`);
          await api.recording_create({
            trackId: track.id,
            protocol: recording.protocol,
            server: recording.server,
            location: recording.location,
          });
          count++;
          progress(count * base * 100);
        }
      });

      await this.handleAlbumSave(actions);
    },

    async onSubmit_checkArtistAutoCreate(artists) {
      const nonExists = artists.filter((artist) => !artist.id);
      if (nonExists.isNotEmpty()) return new Promise((resolve) => {
        this.showGlobalModal({
          title: 'Artists not Exists',
          content: `
Those artists are not exists on this server: <br/>
${nonExists.map((artist) => artist.name).join(', ')} <br/>
Would you want them be auto-created?
`,
          buttonType: 'sao-yes-no',
          onConfirm: () => this.hideGlobalModal().then(() => {
            resolve(true);
          }),
          onCancel: () => this.hideGlobalModal().then(() => {
            resolve(false);
          }),
        });
      });

      return Promise.resolve(true);
    },

    async onSubmit_checkArtistAmbiguous(artists) {
      const ambiguous = artists.filter((artist) => artist.ambiguous);
      if (ambiguous.isNotEmpty()) return new Promise((resolve) => {
        this.showGlobalModal({
          title: 'Artist ambiguous',
          content: `
There are some artists have same names: <br/>
${ambiguous.map((artist) => artist.name).join(', ')}
Would you want to use first matched result as their name?
          `,
          buttonType: 'sao-yes-no',
          onConfirm: () => this.hideGlobalModal().then(() => {
            resolve(true);
          }),
          onCancel: () => this.hideGlobalModal().then(() => {
            resolve(false);
          }),
        });
      });
      return Promise.resolve(true);
    },

    async handleAlbumSave(actions) {
      const { progressModal } = this;
      let i = 0;

      function reportProgress(value) { progressModal.progress = ((i + (value / 100)) * (1 / actions.length)) * 100; }
      function reportTitle(value) { progressModal.progressTitle = value; }

      progressModal.isShow = true;
      progressModal.progressState = 'normal';
      let error = false;

      for (; i < actions.length; i++) {
        try { await actions[i](reportProgress, reportTitle); } catch (e) {
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
