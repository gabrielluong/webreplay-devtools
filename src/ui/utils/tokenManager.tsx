import { Auth0Context, Auth0ContextInterface, Auth0Provider } from "@auth0/auth0-react";
import { AppState } from "@auth0/auth0-react/dist/auth0-provider";
import jwt_decode from "jwt-decode";
import React, { ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { assert, defer, Deferred } from "protocol/utils";

const domain = "webreplay.us.auth0.com";
const clientId = "4FvFnJJW4XlnUyrXQF8zOLw6vNAH1MAo";
const audience = "hasura-api";
const tokenRefreshSecondsBeforeExpiry = 60;

const {
  location: { origin, pathname },
} = window;

export interface TokenState {
  token?: string;
  error?: any;
}

type TokenListener = (state: TokenState) => void;

class TokenManager {
  private auth0Client: Auth0ContextInterface | undefined;
  private deferredState = defer<TokenState>();
  private isTokenRequested = false;
  private refreshTimeout: number | undefined;
  private listeners: TokenListener[] = [];

  Auth0Provider = ({ children }: { children: ReactNode }) => {
    const history = useHistory();

    const onRedirectCallback = (appState: AppState) => {
      history.push(appState?.returnTo || window.location.pathname);
    };

    return (
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        audience={audience}
        redirectUri={origin + pathname}
        onRedirectCallback={onRedirectCallback}
        cacheLocation="localstorage"
        prompt="select_account"
        useRefreshTokens={true}
      >
        <Auth0Context.Consumer>
          {auth0Client => {
            this.auth0Client = auth0Client;
            setTimeout(() => this.update(false), 0);
            return null;
          }}
        </Auth0Context.Consumer>
        {children}
      </Auth0Provider>
    );
  };

  addListener(listener: TokenListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: TokenListener) {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  getToken() {
    return this.deferredState.promise;
  }

  /**
   * This method must be called before using Auth0's loginWithPopup() method.
   */
  reset() {
    this.deferredState = defer<TokenState>();
    this.isTokenRequested = false;
    if (this.refreshTimeout !== undefined) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = undefined;
    }
  }

  private async update(refresh: boolean) {
    if (!this.auth0Client || this.auth0Client.isLoading) {
      return;
    }

    if (this.auth0Client.isAuthenticated) {
      if (this.isTokenRequested) {
        if (refresh) {
          this.reset();
        } else {
          return;
        }
      }

      this.isTokenRequested = true;
      const deferredState = this.deferredState;
      try {
        const token = await this.fetchToken(refresh);

        this.setState({ token }, deferredState);
        if (deferredState === this.deferredState) {
          this.setupTokenRefresh(token);
        }
      } catch (e) {
        this.setState({ error: e }, deferredState);
      }
    } else {
      this.setState({}, this.deferredState);
    }
  }

  private async fetchToken(refresh: boolean) {
    assert(this.auth0Client);

    try {
      return await this.auth0Client.getAccessTokenSilently({ audience, ignoreCache: refresh });
    } catch (e) {
      if (e.error !== "login_required" && e.error !== "consent_required") {
        throw e;
      }
      console.error("Failed to fetch the access token silently - this shouldn't happen!");

      return await this.auth0Client.getAccessTokenWithPopup({ audience, ignoreCache: refresh });
    }
  }

  private setState(state: TokenState, deferredState: Deferred<TokenState>) {
    this.listeners.forEach(listener => listener(state));
    deferredState.resolve(state);
  }

  private setupTokenRefresh(token: string) {
    const decodedToken = jwt_decode<{ exp: number }>(token);
    assert(typeof decodedToken.exp === "number");
    const refreshDelay = Math.max(
      (decodedToken.exp - tokenRefreshSecondsBeforeExpiry) * 1000 - Date.now(),
      0
    );
    this.refreshTimeout = window.setTimeout(() => this.update(true), refreshDelay);
  }
}

export default new TokenManager();
