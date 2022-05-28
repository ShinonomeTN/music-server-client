/**
 * @typedef { Object } NavBarSectionHeader
 * @property { 'section-header' } type
 * @property { String } icon Bootstrap icon name
 * @property { String } title Title for show
 */
/**
 * Create Nav Bar Section Header
 * @param { String } icon Bootstrap icon name
 * @param { String } title Title for show
 * @return { NavBarSectionHeader }
 */
export function navBarSection(icon, title) {
  return { type: 'section-header', icon, title };
}

/**
 * @typedef { Object } NavBarSectionItem
 * @property { 'section-item' | 'section-button' } type
 * @property { String } icon Bootstrap icon name
 * @property { String } title Title for show
 * @property { Function } onClick Action when clicked, will bind `this` to view
 * @property { String } activeFlag Flag for activation, when this string matches
 *                                 the given that produce from route it will be active.
 */
/**
 * Create Nav Bar Section Item
 * @param { String } icon Bootstrap icon name
 * @param { String } title Title for show
 * @param { Function } onClick Click action
 * @param { String } activeFlag Flag string for activation
 * @return { NavBarSectionItem }
 */
export function navBarItem(icon, title, onClick, activeFlag) {
  return { type: 'section-item', icon, title, onClick, activeFlag };
}

/**
 * Create public nav bar section
 * @returns {(NavBarSectionHeader|NavBarSectionItem)[]}
 */
export function navBarPublicSection() {
  return [
    navBarSection('collection-fill', 'Library'),
    navBarItem('person-square', 'Artists', function () {
      if (this.$route.name !== 'AllArtists') this.$router.push({ name: 'AllArtists' }).then();
    }, 'route_name:AllArtists'),
    navBarItem('vinyl-fill', 'Albums', function () {
      if (this.$route.name !== 'AllAlbums') this.$router.push({ name: 'AllAlbums' }).then();
    }, 'route_name:AllAlbums'),
    navBarItem('music-note', 'Tracks', function () {
      if (this.$route.name !== 'AllTracks') this.$router.push({ name: 'AllTracks' }).then();
    }, 'route_name:AllTracks'),
  ];
}

/**
 * Create admin nav bar section
 * @returns {(NavBarSectionHeader|NavBarSectionItem)[]}
 */
export function navBarAdministrationSection() {
  return [
    navBarSection('gear-wide-connected', 'Administration'),

    navBarItem('hdd-stack-fill', 'Server Status', function () {
      if (this.$route.name !== 'AdminServerStatus') this.$router.push({ name: 'AdminServerStatus' }).then();
    }, 'route_name:AdminServerStatus'),

    navBarItem('file-earmark-music-fill', 'Meta Management', function () {
      if (this.$route.name !== 'AdminMetaManagement') this.$router.push({ name: 'AdminMetaManagement' }).then();
    }, 'route_name:AdminMetaManagement'),

    navBarItem('person-circle', 'Users', function () {
      if (this.$route.name !== 'AdminUserManagement') this.$router.push({ name: 'AdminUserManagement' }).then();
    }, 'route_name:AdminUserManagement'),

    navBarItem('toggles', 'Server Preferences', function () {
      if (this.$router.name !== 'AdminServerPreferences') this.$router.push({ name: 'AdminServerPreferences' }).then();
    }, 'route_name:AdminServerPreferences'),
  ];
}
