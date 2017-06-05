import routes from '../routes';
import initLocale from '../support/init-locale';

/**
 * Action factory, implements factory method(s) to create actions based on
 * provided key. See source code for the list of keys and corresponding
 * actions.
 *
 * @author Roman Pushkin (roman.pushkin@gmail.com)
 * @date 2016-05-26
 * @version 1.1
 * @since 0.1.0
 */
export default class ActionFactory {
  /**
   * Creates concrete `Action` instance based on menu location.
   *
   * @author Roman Pushkin (roman.pushkin@gmail.com)
   * @date 2016-05-26
   * @version 1.1
   * @since 0.1.0
   * @param {User} user - {@link User} instance. Action is created
   * based on the following variables:
   *  - `user.state.menuLocation` (optional) - menu location
   *  - `user.state.locale` (optional) - locale (`en`, `ru`, etc.)
   * @return {Object} Instance of `Action`
   */
  static fromMenuLocation(user) {
    const route = user.state.menuLocation || 'default';
    return this.fromRoute({ user, route });
  }

  /**
   * Creates concrete `Action` instance based on route.
   *
   * @author Roman Pushkin (roman.pushkin@gmail.com)
   * @date 2016-08-21
   * @version 1.1
   * @since 0.1.0
   * @param {Object} obj - hash of parameters
   * @param {User} obj.user - {@link User} instance.
   * @param {string} obj.route - route key from {@link Routes}.
   * @return {Object} Instance of `Action`
   */
  static fromRoute(obj) {
    const user = obj.user;
    const route = obj.route;
    const builder = routes[route];

    if (!builder) {
      throw new Error(`Can't find route key "${route}" in routes`);
    }

    return builder({ i18n: initLocale(user), user }); // eslint-disable-line new-cap
  }
}
