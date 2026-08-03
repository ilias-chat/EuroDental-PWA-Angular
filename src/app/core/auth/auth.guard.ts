import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated) {
    return true;
  }
  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated) {
    return true;
  }
  return router.parseUrl(auth.defaultAppTabPath());
};

export const tasksGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canAccessMobileTasks()) {
    return true;
  }
  return router.parseUrl(auth.defaultAppTabPath());
};

export const stockGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canAccessMobileStock()) {
    return true;
  }
  return router.parseUrl(auth.defaultAppTabPath());
};

export const proposeTaskGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canProposeTasks()) {
    return true;
  }
  return router.parseUrl(auth.defaultAppTabPath());
};

export const ticketsGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canAccessTickets()) {
    return true;
  }
  return router.parseUrl(auth.defaultAppTabPath());
};

export const suiviGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.canAccessTasksTracking()) {
    return true;
  }
  return router.parseUrl(auth.defaultAppTabPath());
};
