import {
  DEFAULT_DIRECTION,
  DIRECTION_COOKIE_NAME,
  directions,
} from './direction-utils'

/**
 * TODO: i18n Integration
 * This anti-FOUC script can be completely removed after migrating to i18n
 * (e.g., using next-intl).
 * Server components (layout.tsx) will simply render <html dir={locale === 'ar' ? 'rtl' : 'ltr'}>.
 */
export function DirectionScript() {
  const script = `
    (function () {
      try {
        var cookieName = ${JSON.stringify(DIRECTION_COOKIE_NAME)};
        var defaultDir = ${JSON.stringify(DEFAULT_DIRECTION)};
        var allowedDirections = ${JSON.stringify(directions)};

        var match = document.cookie.match(
          new RegExp('(?:^|; )' + cookieName.replace(/[.*+?^$(){}|\\[\\]\\\\]/g, '\\\\$&') + '=([^;]*)')
        );

        var savedDir = match
          ? decodeURIComponent(match[1])
          : defaultDir;

        var dir = allowedDirections.indexOf(savedDir) !== -1
          ? savedDir
          : defaultDir;

        document.documentElement.setAttribute('dir', dir);
      } catch {
        document.documentElement.setAttribute('dir', '${DEFAULT_DIRECTION}');
      }
    })();
  `

  return (
    <script
      id='direction-preference'
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
