import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak
      .init({
        config: {
          url: 'http://localhost:8180',
          realm: 'pi_Realm',
          clientId: 'pi_frontend'
        },
        initOptions: {
          checkLoginIframe: false,
          enableLogging: true,
          flow: 'standard',
          pkceMethod: 'S256'
        },
        enableBearerInterceptor: true,
        bearerPrefix: 'Bearer',
        bearerExcludedUrls: ['/assets', '/clients/public']
      })
      .catch((err) => {
        console.error('Keycloak initialization failed', err);
        return false;
      });
}
