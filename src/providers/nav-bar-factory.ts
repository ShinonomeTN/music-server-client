/**
 * @typedef { Object } NavBarSectionHeader
 * @property { 'section-header' } type
 * @property { String } icon Bootstrap icon name
 * @property { String } title Title for show
 */
import { Optional } from '@/common/foolish';

export type NavBarItemType = 'section-header' | 'section-item' | 'section-button'

export interface NavBarItem {
  readonly type : NavBarItemType
}

export class NavBarSection implements NavBarItem {
  readonly type: NavBarItemType = 'section-header'
  icon : Optional<string>
  title : Optional<string>

  constructor(icon: Optional<string>, title: Optional<string>) {
    this.icon = icon;
    this.title = title;
  }
}

export class NavBarNavItem implements NavBarItem {
  readonly type: NavBarItemType = 'section-item'
  icon : Optional<string>
  title: string
  onClick : Optional<() => void>
  activeFlag : Optional<string>

  constructor(icon: Optional<string>, title: string, onClick: Optional<() => void>, activeFlag: Optional<string>) {
    this.icon = icon;
    this.title = title;
    this.onClick = onClick;
    this.activeFlag = activeFlag;
  }
}

export class NavBarNavButton implements NavBarItem {
  readonly type: NavBarItemType = 'section-button';
  icon : Optional<string>
  title : Optional<string>
  onClick : Optional<() => void>

  constructor(icon: Optional<string>, title: Optional<string>, onClick: Optional<() => void>) {
    this.icon = icon;
    this.title = title;
    this.onClick = onClick;
  }
}

export function navBarPublicSection() {
  return [
    new NavBarSection('collection-fill', 'Library'),
    new NavBarNavItem('person-square', 'Artists', function () {
      // @ts-ignore
      if (this.$route.name !== 'AllArtists') this.$router.push({ name: 'AllArtists' }).then();
    }, 'route_name:AllArtists'),
    new NavBarNavItem('vinyl-fill', 'Albums', function () {
      // @ts-ignore
      if (this.$route.name !== 'AllAlbums') this.$router.push({ name: 'AllAlbums' }).then();
    }, 'route_name:AllAlbums'),
    new NavBarNavItem('music-note', 'Tracks', function () {
      // @ts-ignore
      if (this.$route.name !== 'AllTracks') this.$router.push({ name: 'AllTracks' }).then();
    }, 'route_name:AllTracks'),
  ];
}

export function navBarAdministrationSection() {
  return [
    new NavBarSection('gear-wide-connected', 'Administration'),

    new NavBarNavItem('hdd-stack-fill', 'Server Status', function () {
      // @ts-ignore
      if (this.$route.name !== 'AdminServerStatus') this.$router.push({ name: 'AdminServerStatus' }).then();
    }, 'route_name:AdminServerStatus'),

    new NavBarNavItem('file-earmark-music-fill', 'Meta Management', function () {
      // @ts-ignore
      if (this.$route.name !== 'AdminMetaManagement') this.$router.push({ name: 'AdminMetaManagement' }).then();
    }, 'route_name:AdminMetaManagement'),

    new NavBarNavItem('person-circle', 'Users', function () {
      // @ts-ignore
      if (this.$route.name !== 'AdminUserManagement') this.$router.push({ name: 'AdminUserManagement' }).then();
    }, 'route_name:AdminUserManagement'),

    new NavBarNavItem('toggles', 'Server Preferences', function () {
      // @ts-ignore
      if (this.$router.name !== 'AdminServerPreferences') this.$router.push({ name: 'AdminServerPreferences' }).then();
    }, 'route_name:AdminServerPreferences'),
  ];
}
