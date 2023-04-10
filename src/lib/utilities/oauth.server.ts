import { env } from "$env/dynamic/private";

const OAuthConfigs = {
  github: {
    params: {
      response_type: "code",
      access_type: "offline",
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      scope: ["user"].join(" ")
    },
    urls: {
      userUrl: "https://api.github.com/user",
      authorizeUrl: "https://github.com/login/oauth/authorize",
      accessTokenUrl: "https://github.com/login/oauth/access_token"
    }
  },
  google: {
    params: {
      response_type: "code",
      access_type: "offline",
      client_id: env.GOOGLE_OAUTH_ID,
      client_secret: env.GOOGLE_OAUTH_SECRET,
      scope: ["https://www.googleapis.com/auth/userinfo.profile"].join(" ")
    },
    urls: {
      accessTokenUrl: "https://oauth2.googleapis.com/token",
      userUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth"
    }
  },
  facebook: {
    params: {
      response_type: "code",
      access_type: "offline",
      client_id: env.FACEBOOK_OAUTH_ID,
      client_secret: env.FACEBOOK_OAUTH_SECRET,
      scope: ["public_profile"].join(" ")
    },
    urls: {
      userUrl: "https://graph.facebook.com/me",
      authorizeUrl: "https://www.facebook.com/v15.0/dialog/oauth",
      accessTokenUrl: "https://graph.facebook.com/v15.0/oauth/access_token"
    }
  }
};

export type Provider = keyof typeof OAuthConfigs;

type OAuthServiceArgs = { redirect_uri: string; provider: Provider };
export class OAuthService {
  public config!: any;
  public provider!: Provider;

  constructor({ provider, redirect_uri }: OAuthServiceArgs) {
    const config = OAuthConfigs[provider];

    if (config) {
      this.provider = provider;
      this.config = Object.assign(config, {
        params: Object.assign(config.params, { redirect_uri })
      });
    }
  }

  public getAuthorizeUrl() {
    const url = new URL(this.config.urls.authorizeUrl);

    Object.keys(this.config.params)
      .filter((key) => key !== "client_secret")
      .forEach((key) => {
        url.searchParams.set(key, this.config.params[key]);
      });

    return url.href;
  }

  public async getAccessToken({ code }: { code: string }) {
    const res = await fetch(this.config.urls.accessTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        ...this.config.params,
        code
      })
    });

    if (res.ok) {
      const json = await res.json();
      if ("access_token" in json) return json;
    }
  }

  public async getUser({ token }: { token: string }) {
    const res = await fetch(this.config.urls.userUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) return await res.json();
  }
}
