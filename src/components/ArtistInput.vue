<template>
  <div ref="container" class="artist-input"
       :class="{
          'dialog-like': showDisAmbiguous,
          'top' : popupPosition === 'top',
          'bottom' : popupPosition === 'bottom'
        }"
       style="flex-grow: 1; display: flex; position: relative"
  >
    <ms-backdrop :z-index="zIndex - 1" :show="showDisAmbiguous" mode="light-glass" @click="showDisAmbiguous = false; selectedIndex = null" />

    <div class="input-form" style="flex-grow: 1;">
      <ms-tag-input style="margin-left: 4px; height: 100%" :tag-object-list="modelValue" placeholder="Input artist name, confirm with Enter."
                    @submit="onAddArtist" @delete="onTryDeleteArtist"
      >
        <template v-slot:tagList="{ item, key }">
          <avatar-with-name-tag
            style="margin-top: 3px; margin-bottom: 3px"
            :image="coverArtOfArtistAt(key)"
            :class="classOfItem(item, key)" :disabled="loadingStateOf(key)" :title="item.name"
            @close="onArtistDelete(key)"
            @click="showDisAmbiguousOptions(key)"
            @created="loadArtistInfo(key,{ artist: item })"
          />
        </template>
        <template v-slot:tailing>
          <slot name="tailing"></slot>
        </template>
      </ms-tag-input>
    </div>

    <div class="dis-ambiguous" v-if="showDisAmbiguous">
      <div v-if="alternativeList.isEmpty()" style="padding: 1rem; font-style: italic">
        <span>No artist matches name '{{modelValue[selectedIndex].name}}'.</span>
      </div>
      <div v-else style="border-bottom: lightgray solid 1px; margin-bottom: 5px">
        <div style="border-bottom: lightgray solid 1px">
          <div v-if="alternativeList.length > 1" style="padding: 1rem; font-style: italic">
            <span>Which '{{modelValue[selectedIndex].name}}' ?</span>
          </div>
          <div v-else-if="alternativeList.length === 1" style="padding: 1rem; font-style: italic">
            <span>Only one '{{modelValue[selectedIndex].name}}' matches result.</span>
          </div>
        </div>
        <div v-for="(item,index) in alternativeList" :key="index"
             class="artist-item"
             @click="onDisAmbiguousItem(item)"
             :class="{ active: item.id === modelValue[selectedIndex].id }"
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
import { nextTick } from 'vue';

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
    popupPosition: {
      type: String,
      default: 'top',
    },
  },
  emits: ['update:modelValue', 'add', 'delete'],
  data() {
    return {
      artistInfoCache: {},
      performDeleteItem: null,
      delay: $delay(1000, 'reject'),
      showDisAmbiguous: false,
      selectedIndex: null,
    };
  },
  mounted() {

  },
  methods: {
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
    },
    onAddArtist(input) {
      if (!input) return;
      const name = input.trim();
      if (name === '') return;

      const artist = {
        id: null,
        name,
        found: false,
        ambiguous: false,
      };
      const newList = [...this.value, artist];
      this.value = newList;
      this.$emit('add', { artist });
      this.artistInfoCache[newList.length - 1] = {
        image: null,
        alternatives: [],
        loading: true,
      };
    },
    async loadArtistInfo(index, { artist }) {
      const info = this.cacheInfoOf(index);

      try {
        const { content } = await api.artist_listAll({ name: artist.name });
        if (content.isEmpty()) {
          artist.found = false;
          artist.ambiguous = false;
          return;
        }
        const artists = content.map((item) => item.artist);
        info.alternatives.clear();
        info.alternatives.addAll(artists);

        if (artist.id !== null) {
          const matched = artists.find((result) => result.id === artist.id);
          if (!matched) { artist.found = false; return; }
          const [coverArt] = matched.coverArts;
          if (coverArt) info.image = api.config.coverArtUrlOf(coverArt.filePath);
          return;
        }

        const [first] = artists;
        artist.id = first.id;
        artist.found = true;
        artist.name = first.name;
        const [coverArt] = first.coverArts;
        if (coverArt) info.image = api.config.coverArtUrlOf(coverArt.filePath);
        if (artists.length > 1) artist.ambiguous = true;
      } catch (e) {
        console.error('Could not load artist info:', e);
      } finally {
        // eslint-disable-next-line vue/valid-next-tick
        await nextTick(() => { info.loading = false; });
      }
    },
    onArtistDelete(index) {
      const target = this.modelValue.find((_, i) => i === index);
      this.$emit('delete', { index, artist: target });
      this.$emit('update:modelValue', this.modelValue.filter((_, i) => i !== index));
      this.artistInfoCache[index] = null;
    },
    onTryDeleteArtist() {
      console.log('try delete');
      this.performDeleteItem = (this.modelValue.length - 1);
      const result = this.delay.do(() => {
        this.performDeleteItem = null;
        console.log('restore color');
      });

      if (!result) {
        const { performDeleteItem } = this;
        const target = this.modelValue.find((_, i) => i === performDeleteItem);
        this.$emit('delete', { index: performDeleteItem, artist: target });
        this.delay.cancel();
        this.onArtistDelete(performDeleteItem);
        this.performDeleteItem = null;
      }
    },
    coverArtUrlOf(item) {
      const [first] = item.coverArts;
      if (!first) return null;
      return api.config.coverArtUrlOf(first.filePath);
    },
    coverArtOfArtistAt(index) {
      return this.cacheInfoOf(index).image;
    },
    cacheInfoOf(index) {
      let infoCache = this.artistInfoCache[index];
      if (!infoCache) {
        infoCache = {
          image: null,
          alternatives: [],
          loading: true,
        };
        this.artistInfoCache[index] = infoCache;
      }
      return infoCache;
    },
    loadingStateOf(index) {
      return this.cacheInfoOf(index).loading;
    },
    classOfItem(item, index) {
      const infoCache = this.artistInfoCache[index] || { loading: false };
      const { performDeleteItem } = this;
      return {
        'bg-secondary': infoCache.loading,
        'bg-danger': (index === performDeleteItem) && !infoCache.loading,
        'bg-success': item.found && !infoCache.loading && (index !== performDeleteItem),
        'bg-warning': !item.found && !infoCache.loading && (index !== performDeleteItem),
        'bg-info': (item.found && item.ambiguous && !infoCache.loading) && (index !== performDeleteItem),
        'avatar-with-name-tag-active': index === this.selectedIndex,
      };
    },
  },
  computed: {
    alternativeList() {
      const { selectedIndex } = this;
      if (selectedIndex === null) return [];
      const info = this.artistInfoCache[selectedIndex];
      if (!info) return [];
      return info.alternatives;
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
  background-color: white;
}

.artist-input.dialog-like.top > .input-form {
  border-radius: 0 0 5px 5px;
}

.artist-input.dialog-like.bottom > .input-form {
  border-radius: 5px 5px 0 0;
}

.artist-input .dis-ambiguous {
  background-color: white;
  border: lightgray solid 1px;

  overflow-x: hidden;
  position: absolute;
  left: 0;
  right: 0;

  min-height: 100%;
}

.artist-input.top .dis-ambiguous {
  border-radius: 5px 5px 0 0;
  bottom: 0;
  margin-bottom: v-bind(componentHeight);
  border-bottom-color: transparent;
}

.artist-input.bottom .dis-ambiguous {
  border-radius: 0 0 5px 5px;
  top: 0;
  margin-top: v-bind(componentHeight);
  border-top-color: transparent;
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
