import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  public async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    // Let Keycloak initialization handle the login redirection via 'login-required'
    // If the user is not authenticated, LOG it and STOP (to break the loop)
    if (!this.authenticated) {
      console.warn('AuthGuard: User not authenticated. Navigation blocked. Please log in manually.');
      return false; 
    }

    // Get the roles required from the route.
    const requiredRoles = route.data['roles'];

    // Allow the user to proceed if no additional roles are required to access the route.
    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true;
    }

    // Allow the user to proceed if all the required roles are present.
    // Normalize both user roles and required roles for case-insensitive matching
    const userRoles = (this.roles || []).map(r => r.toLowerCase());
    return requiredRoles.every((role) => 
      userRoles.includes(role.toLowerCase()) || 
      userRoles.includes('role_' + role.toLowerCase())
    );
  }
}
