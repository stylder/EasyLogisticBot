import Action from '../../../action';
import RequestLocationResponse from '../../../responses/request-location-response';
import CompositeResponse from '../../../responses/composite-response';
import UpdateLocationResponse from '../../../responses/update-location-response';
import UserStateResponse from '../../../responses/user-state-response';
import TextResponse from '../../../responses/text-response';
import RedirectResponse from '../../../responses/redirect-response';
import If from '../../../responses/if-response';
import Location from '../../../conditions/location';
import ErrorResponse from '../../../responses/error-response';

/**
 * Driver request location menu action.
 * Asking driver to provide location.
 *
 * @author Roman Pushkin (roman.pushkin@gmail.com)
 * @date 2016-09-04
 * @version 1.1
 * @since 0.1.0
 */
export default class DriverRequestLocation extends Action {

  /**
   * Constructor.
   */
  constructor(options) {
    super(Object.assign({ type: 'driver-request-location' }, options));
  }

  /**
   * Returns `text` and `request location` responses.
   *
   * @return {CompositeResponse} Returns instance of {@link CompositeResponse}
   * which contains {@link TextResponse} and {@link RequestLocationResponse}.
   */
  get() {
    return new CompositeResponse()
      .add(new TextResponse({ message: this.t('provide_location') }))
      .add(new RequestLocationResponse({ buttonText: this.gt('location_button_text') }));
  }

  /**
   * If location is valid, save user location to database, reply with OK message, and
   * redirect to `explain-whats-next` menu action.
   *
   * @param {Array} value - array of two elements that represents location, for
   * example: `[37.421955, -122.084058]`
   * @return {IfResponse} response - instance of conditional response
   */
  post(value) {
    return new If({
      condition: new Location(value),
      ok: new CompositeResponse()
        .add(new UpdateLocationResponse({ location: value }))
        .add(new UserStateResponse({ location: value }))
        .add(new TextResponse({ message: '👌 OK!' }))
        .add(new RedirectResponse({ path: 'driver-request-radius' })),
      err: new ErrorResponse({ message: this.gt('error_location') }),
    });
  }
}
