<template>
  <div ref="container" class="artist-input" :class="{'dialog-like': showDisAmbiguous}" style="flex-grow: 1; display: flex; position: relative">
    <ms-backdrop :z-index="zIndex - 1" :show="showDisAmbiguous" mode="light-glass" @click="showDisAmbiguous = false; selectedIndex = null" />

    <div class="input-form" style="flex-grow: 1;">
      <ms-tag-input style="margin-left: 4px; height: 100%" :tag-object-list="artists" placeholder="Input artist name, confirm with Enter."
                    @submit="onAddArtist" @delete="onTryDeleteArtist"
      >
        <template v-slot:tagList="{ item, key }">
          <avatar-with-name-tag style="margin: 3px 0"
                                :class="classOfItem(item, key)" :disabled="item.loading" :title="item.name"
                                @close="onArtistDelete(key)"
                                @click="showDisAmbiguousOptions(key)"
          />
        </template>
        <template v-slot:tailing>
          <slot name="tailing"></slot>
        </template>
      </ms-tag-input>
    </div>

    <div class="dis-ambiguous" v-if="showDisAmbiguous">
      <div v-if="alternativeList.isEmpty()" style="padding: 1rem; font-style: italic">
        <span>No artist match name '{{artists[selectedIndex].name}}'.</span>
      </div>
      <div v-else style="border-bottom: lightgray solid 1px; margin-bottom: 5px">
        <div v-for="(item,index) in alternativeList" :key="index"
             class="artist-item"
             @click="onDisAmbiguousItem(item)"
             :class="{ active: item.id === artists[selectedIndex].id }"
        >
          <ms-image-view :src="coverArtUrlOf(item)" width="32px" height="32px" border-radius="4px">
            <template v-slot:empty-image>
              <div class="view-absolute" style="display: flex; justify-content: center; align-items: center">
                <i class="bi-person-fill" style="font-size: 15px" />
              </div>
            </template>
          </ms-image-view>
          <div style="flex-grow: 1" class="ms-2">
            <div style="font-size: smaller; font-weight: bold">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AvatarWithNameTag from '@/components/AvatarWithNameTag.vue';
import MSTagInput from '@/components/MSTagInput.vue';
import api from '@/api';
import { $delay } from '@/common/utils';
import MSImageView from '@/components/MSImageView.vue';
import MSBackdrop from '@/components/MSBackdrop.vue';

function mapArtists(item) {
  return {
    id: item.id,
    name: item.name,
    found: item.found,
    ambiguous: item.ambiguous,
  };
}

export default {
  name: 'ArtistInput',
  components: {
    AvatarWithNameTag,
    'ms-tag-input': MSTagInput,
    'ms-image-view': MSImageView,
    'ms-backdrop': MSBackdrop,
  },
  props: {
    zIndex: {
      type: [Number, String],
      default: 500,
    },
    modelValue: Array,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      artists: [],
      performDeleteItem: null,
      delay: $delay(1000, 'reject'),
      showDisAmbiguous: false,
      selectedIndex: null,
    };
  },
  methods: {
    onUpdateArtist() {
      this.value = this.artists.map(mapArtists);
    },
    showDisAmbiguousOptions(index) {
      this.selectedIndex = index;
      this.showDisAmbiguous = true;
    },
    onDisAmbiguousItem(item) {
      const selected = this.artists[this.selectedIndex];
      selected.id = item.id;
      selected.ambiguous = false;
      this.showDisAmbiguous = false;
      this.selectedIndex = null;

      this.onUpdateArtist();
    },
    onAddArtist(input) {
      if (!input) return;
      const name = input.trim();
      if (name === '') return;
      this.artists.push({
        id: null,
        name,
        image: null,
        alternatives: [],
        found: false,
        ambiguous: false,
        loading: true,
      });
      const artist = this.artists.last();
      this.onUpdateArtist();

      this.loadArtistInfo({ artist });
    },
    async loadArtistInfo({ artist }) {
      try {
        const page = await api.artist_listAll({ name: artist.name });
        if (page.empty) return;
        const artists = page.content.map((item) => item.artist);
        artist.alternatives.clear();
        artist.alternatives.addAll(artists);
        const [first] = artists;
        artist.id = first.id;
        artist.found = true;
        artist.name = first.name;
        const [coverArt] = first.coverArts;
        if (coverArt) artist.image = api.config.coverArtUrlOf(coverArt.filePath);
        if (artists.length > 1) artist.ambiguous = true;

        this.onUpdateArtist();
      } catch (e) {
        console.error('Could not load artist info:', e);
      } finally {
        artist.loading = false;
      }
    },
    onArtistDelete(index) {
      this.artists.delete(index);
      this.onUpdateArtist();
    },
    onTryDeleteArtist() {
      console.log('try delete');
      this.performDeleteItem = (this.artists.length - 1);
      const result = this.delay.do(() => {
        this.performDeleteItem = null;
        console.log('restore color');
      });
      if (!result) {
        this.delay.cancel();
        this.artists.delete(this.performDeleteItem);
        this.performDeleteItem = null;
        this.onUpdateArtist();
      }
    },
    coverArtUrlOf(item) {
      const [first] = item.coverArts;
      if (!first) return null;
      return api.config.coverArtUrlOf(first.filePath);
    },
    classOfItem(item, index) {
      return {
        'bg-secondary': item.loading,
        'bg-danger': (index === this.performDeleteItem) && !item.loading,
        'bg-success': item.found && !item.loading && (index !== this.performDeleteItem),
        'bg-warning': !item.found && !item.loading && (index !== this.performDeleteItem),
        'bg-info': (item.found && item.ambiguous && !item.loading) && (index !== this.performDeleteItem),
        'avatar-with-name-tag-active': index === this.selectedIndex,
      };
    },
  },
  computed: {
    alternativeList() {
      const { selectedIndex } = this;
      if (selectedIndex === null) return [];
      return this.artists[selectedIndex].alternatives;
    },
    componentHeight() {
      return `${this.$refs.container.clientHeight}px`;
    },
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
  },
};
</script>

<style scoped>
.avatar-with-name-tag {
  transition: all 0.3s;
  border: transparent solid 2px;
}

.avatar-with-name-tag-active {
  border: var(--ms-button-active-bg-color, orange) solid 2px;
}

.artist-input > .input-form {
  border: transparent solid 1px;
  border-top: none!important;
}

.artist-input.dialog-like > .input-form,.dis-ambiguous {
  z-index: v-bind(zIndex);
}

.artist-input.dialog-like > .input-form {
  border: lightgray solid 1px;
  border-radius: 0 0 5px 5px;
  background-color: white;
}

.artist-input .dis-ambiguous {
  background-color: white;
  border: lightgray solid 1px;

  border-radius: 5px 5px 0 0;
  overflow-x: hidden;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100%;
  margin-bottom: v-bind(componentHeight);
}

.artist-input .dis-ambiguous .artist-item {
  white-space: nowrap;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
  padding: 5pt;
  cursor: pointer;
}

.artist-input .dis-ambiguous .artist-item.active {
  background-color: var(--ms-button-active-bg-color, orange);
  transition: background-color 0.3s;
}

.artist-input .dis-ambiguous .artist-item.active:hover {
  background-color: var(--ms-button-active-heightlight-bg-color, orange);
  transition: background-color 0.3s;
}

.artist-input .dis-ambiguous .artist-item:hover {
  background-color: whitesmoke;
  transition: background-color 0.3s;
}
</style>
