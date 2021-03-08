/**
 * Base Login Authorizer class that is used by the User Interface to login using a variety 
 * of different login providers (e.g. Google, Facebook, etc.)
 */
class LoginAuthorizer {
    /**
     * Attempt to login to a user's account. Note that this is implementation dependant.
     * On success, the login status of the user will change and should be queried accordingly.
     * See {@link BaseBackend} for more information on how this kind of querying should
     * be done.
     */
    async login() {}
}

export default LoginAuthorizer;
