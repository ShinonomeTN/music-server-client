<template>
<transition name="ani-switch" mode="out-in">
  <div v-if="!isEditMode || (isEditMode && !album.isLoading)" style="text-align: left; flex-grow: 1; display: flex; flex-flow: column">
    <div class="p-3 ms-2" style="font-size: large; display: flex;">
      <ms-input style="flex-grow: 1; align-items: center" v-model="album.title.value" placeholder="Album Title" @update:modelValue="album.didChanged = true">
        <template v-slot:leading>
          <span v-if="!isEditMode">Create</span>
          <span v-else>Edit</span>
          <span>&nbsp;</span>
        </template>
      </ms-input>
    </div>

    <div class="ms-flex-scrollable-container">
      <div class="content-wrapper" style="overflow: hidden scroll">
        <div class="content ms-2">

          <ms-nav-section-header title="Album Artists" icon="person-square" style="font-size: smaller"/>
          <div class="ms-2 me-3" style="display: flex">
            <artist-input style="flex-grow: 1" v-model="album.artists" popup-position="bottom">
              <template v-slot:tailing>
                <button class="ms-2 btn btn-primary btn-sm m-1" @click="fillTrackArtists">
                  <span style="white-space: nowrap">Use track artists</span>
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
                         @addRecording="album.didChanged = true; isEditMode && onAddRecording(track, $event)"
                         @deleteRecording = "album.didChanged = true; isEditMode && onDeleteRecording($event)"
                         @updateRecording="album.didChanged = true; isEditMode && onUpdateRecording(track ,$event.target)"
                         @update:title="album.didChanged = true; isEditMode && onUpdateTrack(diskIndex, track)"
                         @update:trackIndex="album.didChanged = true; isEditMode && onUpdateTrack(diskIndex, track)"
                         @update:artists="album.didChanged = true; isEditMode && onUpdateTrack(diskIndex, track)"
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

    <div class="m-3" style="display: flex;">
      <button class="btn btn-primary" @click="onSubmit">
        <i class="bi-save-fill"/>
        <span> Save</span>
      </button>
      <div style="flex-grow: 1"></div>
      <div class="btn btn-success" @click="onAddDisk">
        <i class="bi-plus-lg"/>
        <span> Add Disk</span>
      </div>
    </div>
  </div>
  <div v-else-if="isEditMode && album.isLoading" style="display: flex; flex-grow: 1; justify-content: center; align-items: center; flex-flow: column">
    <div class="spinner-border m-3"></div>
    <div>Loading Album Data...</div>
  </div>
</transition>

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

function isModifyAction(action) {
  return (action === 'create') || (action === 'update');
}

function deleteAction(id) {
  return { action: 'delete', ref: id };
}

function createAction(data) {
  return { action: 'create', data };
}

function updateAction(data) {
  return { action: 'update', data };
}

async function doSubActions(actions, progress) {
  if (actions.isEmpty()) { progress(100); return; }
  const base = 1 / actions.length;
  let count = 0;
  for (const action of actions) {
    await action();
    count++;
    progress(count * base * 100);
  }
  progress(100);
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
        didChanged: false,
      },

      editHistory: {
        tracks: [],
        recordings: [],
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
  async mounted() {
    if (this.isEditMode) { await this.initData(); }
    this.album.didChanged = false;
  },
  // async beforeRouteLeave(to, from, next) {
  //   // eslint-disable-next-line no-return-await
  //   if (!this.album.didChanged) next();
  //
  //   const result = await new Promise((resolve) => {
  //     this.showGlobalModal({
  //       title: 'Leave without saving',
  //       content: 'Would you want to leave? All changes will be discarded.',
  //       buttonType: 'sao-yes-no',
  //       confirmText: 'YES',
  //       cancelText: 'NO',
  //       onConfirm: () => this.hideGlobalModal()
  //         .then(() => resolve(true)),
  //       onCancel: () => this.hideGlobalModal()
  //         .then(() => resolve(false)),
  //     });
  //   });
  //
  //   if (!result) { next(false); return; }
  //
  //   next();
  // },
  methods: {
    async initData() {
      this.album.isLoading = true;
      try {
        const { albumId } = this;
        const album = await api.album_get(albumId).then((data) => data.album);
        const artistMapping = (artist) => ({
          id: artist.id,
          name: artist.name,
          found: true,
          ambiguous: false,
        });

        const coverArtMapping = (coverArt) => ({
          type: 'cover-art',
          data: coverArt,
          preview: api.config.coverArtUrlOf(coverArt.filePath),
        });

        const trackMapping = (track) => ({
          title: track.title,
          id: track.id,
          index: track.trackNumber,
          disk: track.diskNumber,
          recordings: track.recordings.map((recording) => ({
            id: recording.id,
            protocol: recording.protocol,
            server: recording.server,
            location: recording.location,
          })),
          artists: track.artists.map(artistMapping),
        });

        this.album.id = album.id;
        this.album.title.value = album.name;
        this.album.artists.addAll(album.artists.map(artistMapping));
        this.album.coverArts.addAll(album.coverArts.map(coverArtMapping));

        const tracks = (await api.album_tracks(this.albumId)).map((data) => data.track);
        const disks = (() => {
          const entries = Object.entries(tracks.groupBy((track) => track.diskNumber));
          entries.sort(([a], [b]) => (a || 0) - (b || 0));
          return entries.map(([, value]) => value);
        })();
        disks.forEach((disk) => {
          this.album.disks.push({ tracks: disk.map(trackMapping) });
        });
      } finally {
        this.album.isLoading = false;
      }
    },

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

    async onDeleteDisk(diskIndex) {
      const result = await new Promise((resolve) => {
        this.showGlobalModal({
          title: `Delete Disk ${diskIndex + 1}`,
          content: `
Are you sure to delete disk ${diskIndex + 1} ?
<br/> Track data in this disk will all be deleted. ${this.isEditMode ? '' : 'This operation cannot be reverted.'}
`.trim(),
          onConfirm: () => this.hideGlobalModal().then(() => resolve(true)),
          onCancel: () => this.hideGlobalModal().then(() => resolve(false)),
          buttonType: 'sao-yes-no',
        });
      });

      if (!result) return;

      const { album } = this;
      if (this.isEditMode) {
        const trackHistory = this.editHistory.tracks;
        const recordingHistory = this.editHistory.recordings;
        // Delete tracks and recordings that exists on server
        const disk = album.disks[diskIndex];
        const existTrack = disk.tracks.filter((track) => !!track.id);
        const existRecordings = existTrack.flatMap((track) => track.recordings.filter((recording) => !!recording.id));
        trackHistory.addAll(existTrack.map((track) => deleteAction(track.id)));
        recordingHistory.addAll(existRecordings.map((recording) => deleteAction(recording.id)));

        // Delete tracks and recordings that newly created
        const newTracks = disk.tracks.filter((track) => !track.id);
        const newRecordings = newTracks.recordings.filter((recording) => !recording.id);

        newTracks.forEach((newTrack) => {
          trackHistory.deleteWhere(({ action, data }) => (isModifyAction(action) && data.track === newTrack));
        });
        newRecordings.forEach((newRecording) => {
          recordingHistory.deleteWhere(({ action, data }) => (isModifyAction(action) && data.recording === newRecording));
        });
      }

      this.album.disks.delete(diskIndex);
    },

    onAddTrack(diskIndex) {
      const { tracks } = this.album.disks[diskIndex];
      const { length } = tracks;
      const newTrack = {
        title: null,
        index: length + 1,
        recordings: [],
        artists: [],
        disk: diskIndex + 1,
      };
      tracks.push(newTrack);
      if (this.isEditMode) this.editHistory.tracks.push({ action: 'create',
        data: {
          diskId: diskIndex + 1,
          track: newTrack,
        },
      });
    },

    async onDeleteTrack(diskIndex, trackIndex) {
      const track = this.album.disks[diskIndex].tracks[trackIndex];
      const result = await new Promise((resolve) => {
        this.showGlobalModal({
          title: 'Delete track',
          content: `
Are you sure to delete ${track.title ? (`track '${track.title}'`) : 'this track'} (at disk ${diskIndex + 1}, index ${track.index})?
<br/> Track data will be deleted. ${this.isEditMode ? '' : 'This operation cannot be reverted.'}
`.trim(),
          onConfirm: () => this.hideGlobalModal().then(() => resolve(true)),
          onCancel: () => this.hideGlobalModal().then(() => resolve(false)),
          buttonType: 'sao-yes-no',
        });
      });
      if (!result) return;

      if (this.isEditMode) {
        if (!!track.id) {
          // Delete recordings that exist on server
          const recordings = track.recordings.filter((recording) => !!recording.id);
          this.editHistory.recordings.addAll(recordings.map((recording) => ({ action: 'delete', ref: recording.id })));

          // Delete recordings that newly created.
          const newRecordings = track.recordings.filter((recording) => !recording.id);
          newRecordings.forEach((newRecording) => {
            this.editHistory.recordings.deleteWhere(({ action, data }) => (isModifyAction(action) && data.recording === newRecording));
          });

          // Delete track that exists on server
          this.editHistory.tracks.push(deleteAction(track.id));
        } else {
          this.editHistory.tracks.deleteWhere(({ action, data }) => (isModifyAction(action) && data.track === track));
        }
      }

      this.album.disks[diskIndex].tracks.delete(trackIndex);
    },

    onUpdateTrack(diskIndex, track) {
      if (!track.id) return;
      let update = this.editHistory.tracks.find(({ action, data }) => (isModifyAction(action) && (data.track.id === track.id)));
      if (!update) {
        update = updateAction({ diskId: diskIndex + 1, track });
        this.editHistory.tracks.push(update);
      }
    },

    onUpdateRecording(track, recording) {
      if (!recording.id) return;
      const { editHistory } = this;
      let update = editHistory.recordings.find(({ action, data }) => (isModifyAction(action) && (data.recording.id === recording.id)));
      if (!update) {
        update = updateAction({ track, recording });
        editHistory.recordings.push(update);
      }
    },

    onAddRecording(track, recording) {
      this.editHistory.recordings.push(createAction({ track, recording }));
    },

    onDeleteRecording({ target }) {
      this.editHistory.recordings.deleteWhere(({ action, data }) => (isModifyAction(action) && data === target));
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

        await doSubActions(
          artists.filter((artist) => artist.id === null).map((artist) => {
            title(`Creating Artist '${artist.name}'.`);
            return api.artist_create({ name: artist.name }).then((data) => {
              artist.id = data.artist.id;
            });
          }),
          progress,
        );
      });

      // Create cover arts
      actions.push(async (progress, title) => {
        const coverArts = album.coverArts.filter((coverArt) => (coverArt.type === 'file'));
        if (coverArts.isEmpty()) { progress(100); return; }
        title('Uploading cover art');
        progress(1);
        const base = 1 / coverArts.length;
        let count = 0;
        for (const coverArt of coverArts) {
          const newCoverArt = (await api.coverArt_upload([coverArt.data], (event) => {
            if (event.lengthComputable) progress(((count + (event.loaded / event.total)) * base) * 100);
          }).then((data) => data.first().coverArt));
          coverArt.data = newCoverArt;
          coverArt.id = newCoverArt.id;
          coverArt.type = 'cover-art';
          count++;
          progress(count * base * 100);
        }
      });

      if (this.isEditMode) {
        // Update album
        actions.push(async (progress, title) => {
          title(`Updating album '${album.title.value}'`);
          progress(1);
          await api.album_save(this.albumId, {
            title: album.title.value,
            artistIds: artists.mapNotNull((artist) => artist.id),
            coverArtIds: album.coverArts.mapNotNull((coverArt) => ((coverArt.type === 'file') ? coverArt.id : coverArt.data.id)),
          });
          progress(100);
        });

        // Update tracks
        actions.push(async (progress, title) => {
          const historyActions = this.editHistory.tracks.groupBy(({ action }) => action);
          await doSubActions([
            ...(historyActions.delete ? historyActions.delete.map(({ ref }) => () => {
              title(`Deleting track @${ref}`);
              return api.track_delete(ref);
            }) : []),
            ...(historyActions.update ? historyActions.update.map(({ data }) => () => {
              title(`Updating track '${data.track.title}'`);
              const { diskId, track } = data;
              return api.track_update(track.id, {
                title: track.title,
                artistIds: track.artists.map((artist) => artist.id),
                albumId: this.albumId,
                diskNumber: diskId,
                trackNumber: track.index,
              });
            }) : []),
            ...(historyActions.create ? historyActions.create.map(({ data }) => () => {
              const { diskId, track } = data;
              title(`Creating track '${track.title}'`);
              return api.track_create({
                title: track.title,
                artistIds: track.artists.map((artist) => artist.id),
                albumId: this.albumId,
                diskNumber: diskId,
                trackNumber: track.index,
              }).then((r) => { track.id = r.track.id; });
            }) : []),
          ], progress);
        });

        // Update recordings
        actions.push(async (progress, title) => {
          const historyActions = this.editHistory.recordings.groupBy(({ action }) => action);
          await doSubActions([
            ...(historyActions.delete ? historyActions.delete.map(({ ref }) => () => {
              title(`Deleting recording @${ref}`);
              return api.recording_delete(ref);
            }) : []),
            ...(historyActions.update ? historyActions.update.map(({ data }) => {
              title(`Updating recording @${data.id}`);
              return api.recording_update(data.id, {
                protocol: data.protocol,
                server: data.server,
                location: data.location,
              });
            }) : []),
            ...(historyActions.create ? historyActions.update.map((({ data }) => {
              title('Appending recordings');
              const { track, recording } = data;
              return api.recording_create({
                trackId: track.id,
                ...recording,
              }).then((r) => { recording.id = r.recording.id; });
            })) : []),
          ], progress);

          actions.push(async () => {
            this.editHistory.recordings.clear();
            this.editHistory.tracks.clear();
          });
        });
      } else {
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
      }

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

      if (!this.isEditMode) {
        this.progressModal.onClose = this.$refs.progressModal.hideModalBody().then(() => {
          this.progressModal.isShow = false;
          this.$router.push({ name: 'AlbumView', params: { albumId: this.album.id } });
        });
      }
      progressModal.footerEnabled = true;
      this.album.didChanged = false;
    },
  },
  computed: {
    isEditMode() {
      return `${this.albumId || ''}`.trim() !== '';
    },
  },
};
</script>

<style scoped>

</style>
