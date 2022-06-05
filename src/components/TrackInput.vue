<template>
<div class="ms-track-input" ref="container" :class="classes">
  <ms-backdrop :z-index="zIndex - 50" :show="showDrawer" mode="light-glass" @click="showDrawer = false;" />
  <div class="input-form">
    <ms-input style="min-width: 1rem; max-width: 2rem; margin: 0 1rem; text-align: center; height: 100%; overflow: hidden"
              v-model="trackIndexValue"
              input-type="text" max-length="3"
              placeholder="Index"
    />

    <ms-input style="flex-grow: 1; align-items: center" placeholder="Input track title here"
              v-model="trackTitle"
    >
      <template v-slot:tailing>
        <div style="display: flex">
          <div class="artist-clickable" @click="showDrawer = !showDrawer">
            <div style="font-size: small">Artists</div>
            <div style="font-size: smaller; white-space: nowrap; font-weight: bold">{{ artistPreview }}</div>
          </div>
          <slot name="tailing">

          </slot>
        </div>
      </template>
    </ms-input>
  </div>
  <div v-if="showDrawer" class="drawer">
    <div class="container">
      <ms-nav-section-header title="Track Artists" icon="person-square"
                             style="font-size: smaller; padding-left: 5px; padding-right: 5px"
      />
      <artist-input style="min-height: 40px; margin: 0 5px" :z-index="zIndex + 100" v-model="artistList"/>
      <ms-nav-section-header title="Recordings" icon="file-earmark-music-fill"
                             style="font-size: smaller; padding-left: 5px; padding-right: 5px"
      />
      <div style="margin: 5px">
        <recording-item v-for="(item, index) in recordings" :key="index"
                        v-model:server="item.server"
                        v-model:protocol="item.protocol"
                        v-model:location="item.location"
                        @delete="onDeleteRecording(index, item)"
                        @update:server="this.$emit('updateRecording', { target: item })"
                        @update:protocol="this.$emit('updateRecording', { target: item })"
                        @update:location="this.$emit('updateRecording', { target: item })"
        />
      </div>
      <div style="padding: 0 5px">
        <ms-input placeholder="Recording URL"
                  @keydown.enter="onAddRecording" v-model="recordingInput"
        >
          <template v-slot:tailing>
            <button class="m-1 btn btn-success btn-sm" @click="onAddRecording" :disabled="!canAddRecording">
              <i class="bi-plus-lg" />
            </button>
          </template>
        </ms-input>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import ArtistInput from '@/components/ArtistInput.vue';
import MSNavSectionHeader from '@/components/MSNavSectionHeader.vue';
import MSBackdrop from '@/components/MSBackdrop.vue';
import RecordingItem from '@/components/RecordingItem.vue';
import MSInput from '@/components/MSInput.vue';
import { extractUrlComponents } from '@/common/utils';

export default {
  name: 'TrackInput',
  components: {
    ArtistInput,
    'ms-backdrop': MSBackdrop,
    'ms-nav-section-header': MSNavSectionHeader,
    RecordingItem,
    'ms-input': MSInput,
  },
  emits: [
    'update:artists', 'update:title', 'update:recordings', 'update:trackIndex',
    'addRecording', 'deleteRecording', 'updateRecording',
  ],
  props: {
    zIndex: [Number, String],
    title: String,
    artists: Array,
    recordings: Array,
    trackIndex: Number,
    position: {
      type: String,
      default: 'top',
    },
  },
  data() {
    return {
      showDrawer: false,
      recordingInput: null,
      recordingList: [],
    };
  },
  methods: {
    onAddRecording() {
      if (!this.canAddRecording) return;
      const components = extractUrlComponents(this.recordingInput.trim());
      if (!components) return;
      this.recordingList.push(components);
      this.$emit('update:recordings', [...this.recordings, components]);
      this.$emit('addRecording', { recording: components });
      this.recordingInput = '';
      const { location } = components;

      // Filename auto-complete
      if (location && location !== '' && (!this.title || this.title === '')) {
        const last = location.split('/').last().trim(); if (last === '') return;
        const [matched, filename] = last.match(/^(.+?)(\..+?)[?]?.+$/); if (!matched) return;
        this.$emit('update:title', decodeURIComponent(filename));
      }
    },
    onDeleteRecording(index, recording) {
      this.$emit('update:recordings', this.recordings.filter((_, i) => i !== index));
      this.$emit('deleteRecording', { index, target: recording });
    },
  },
  computed: {
    componentHeight() {
      const { container } = this.$refs;
      return `${container.clientHeight}px`;
    },
    artistPreview() {
      if (this.artists.isEmpty()) return 'Unknown';
      const artists = this.artists.map((artist) => artist.name);
      if (artists.length <= 3) return artists.join(' & ');
      if (artists.length <= 10) {
        const first3 = artists.take(3);
        const remaining = artists.drop(3).length;
        return `${first3.join((' & '))} and ${remaining} more`;
      }
      return 'Various Artists';
    },
    canAddRecording() {
      const url = this.recordingInput;
      if (!url) return false;
      return !!extractUrlComponents(url.trim());
    },
    classes() {
      const classes = {
        'dialog-like': this.showDrawer,
      };
      classes[this.position] = true;
      return classes;
    },
    artistList: {
      get() {
        return this.artists;
      },
      set(value) {
        this.$emit('update:artists', value);
      },
    },
    trackTitle: {
      get() {
        return this.title;
      },
      set(value) {
        this.$emit('update:title', value);
      },
    },
    trackIndexValue: {
      get() {
        return this.trackIndex;
      },
      set(value) {
        this.$emit('update:trackIndex', value);
        this.$emit('updateTrackIndex', value)
      },
    },
  },
};
</script>

<style>
.ms-track-input {
  position: relative;
  display: flex;
}

.ms-track-input > .input-form {
  display: flex;
  align-items: center;
  flex-grow: 1;
  border: transparent solid 1px;
}

.ms-track-input > .drawer {
  transition: all 0.3s;
  position: absolute;
  left: 0;
  right: 0;
  border: lightgray solid 1px;
  background-color: white;
  min-height: 100%;
}

.ms-track-input.dialog-like > .input-form,.drawer {
  z-index: v-bind(zIndex + 1);
  background-color: white;
}

/* Artist button */

.ms-track-input .artist-clickable {
  display: flex;
  flex-flow: column;
  justify-content: center;
  cursor: pointer;
  padding-left: 10px;
  padding-right: 10px;
  border: transparent solid 1px;
  position: relative;
}

.ms-track-input:not(.dialog-like) .artist-clickable:hover {
  background-color: var(--ms-button-heightlight-bg-color);
  border: lightgray solid 1px;
}

.ms-track-input.dialog-like .artist-clickable {
  background-color: white;
}

.ms-track-input .drawer .container {
  padding: 0 5px 5px 5px;
}

/* Top drawer */

.ms-track-input.dialog-like.top .drawer {
  bottom: 0;
  margin-bottom: v-bind(componentHeight);
  border-radius: 4px 4px 0 0;
  border-bottom-color: transparent;
}

/*.ms-track-input.top .drawer .container {*/
/*  border-bottom: lightgray solid 1px;*/
/*}*/

.ms-track-input.dialog-like.top > .input-form {
  border-radius: 0 0 4px 4px;
  border-color: lightgray;
}

.ms-track-input.dialog-like.top .artist-clickable {
  border-color: lightgray;
  border-width: 0 1px 1px 1px;
  border-radius: 0 0 4px 4px;
  border-style: solid;
  border-top: white solid 1px;
  top: -1px;
}

/* Bottom drawer */

.ms-track-input.dialog-like.bottom > .input-form {
  border-radius: 4px 4px 0 0;
  border-color: lightgray;
}

.ms-track-input.dialog-like.bottom .artist-clickable {
  border-color: lightgray;
  border-width: 1px 1px 0 1px;
  border-style: solid;
  border-bottom: white solid 2px;
  border-radius: 4px 4px 0 0;
  bottom: -1px;
}

.ms-track-input.bottom > .drawer {
  top: 0;
  margin-top: v-bind(componentHeight);
  border-radius: 0 0 4px 4px;
  border-top-color: transparent;
}
</style>
