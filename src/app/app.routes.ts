// import { Routes } from '@angular/router';
// import { authGuard, emailVerifiedGuard, guestGuard, hasStructureGuard, roleGuard } from './core/auth/guards/auth-guard';

// export const routes: Routes = [

//   // ── Redirect racine ──────────────────────────────────────────────
//   { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

//   // ── Auth (layout sans navbar/sidebar) ────────────────────────────
//   {
//     path: 'auth',
//     // loadComponent: () => import('./core/auth/layouts/auth-layout.component').then(m => m.AuthLayoutComponent),
//     children: [
//       { path: '',              redirectTo: 'login', pathMatch: 'full' },
//       {
//         path: 'login',
//         canActivate: [guestGuard],
//         loadComponent: () => import('./core/auth/pages/login/login').then(m => m.LoginComponent),
//       },
//       {
//         path: 'register',
//         canActivate: [guestGuard],
//         loadComponent: () => import('./core/auth/pages/register/register').then(m => m.RegisterComponent),
//       },
//     //   {
//     //     path: 'forgot-password',
//     //     canActivate: [guestGuard],
//     //     loadComponent: () => import('./auth/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
//     //   },
//     //   {
//     //     path: 'reset-password',
//     //     canActivate: [guestGuard],
//     //     loadComponent: () => import('./core/auth/pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
//     //   },
//     //   {
//     //     path: 'verify-email',
//     //     canActivate: [authGuard],
//     //     loadComponent: () => import('./core/auth/pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
//     //   },
//     //   {
//     //     path: 'onboarding',
//     //     canActivate: [authGuard, emailVerifiedGuard, roleGuard('owner')],
//     //     loadComponent: () => import('./core/auth/pages/onboarding/onboarding.component').then(m => m.OnboardingComponent),
//     //   },
//     ]
//   },

//   // ── App (layout avec navbar/sidebar) ─────────────────────────────
//   {
//     path: '',
//     loadComponent: () => import('./layouts/app-layout/app-layout').then(m => m.AppLayout),
//     canActivate: [authGuard],
//     children: [

//       // Super admin
//       {
//         path: 'structures',
//         // canActivate: [roleGuard('super_admin')],
//         loadComponent: () => import('./features/structures/pages/structures/structures').then(m => m.Structures),
//       },
//       {
//         path: 'structures/:structureId',
//         // canActivate: [roleGuard('super_admin')],
//         loadComponent: () => import('./features/structures/pages/structure-details/structure-details').then(m => m.StructureDetails),
//       },

//       // Membre / employé
//       {
//         path: 'properties',
//         // canActivate: [roleGuard('owner', 'employee'), hasStructureGuard],
//         loadComponent: () => import('./features/properties/pages/properties/properties').then(m => m.Properties),
//       },
//       {
//         path: 'property/:propertyId',
//         // canActivate: [roleGuard('owner', 'employee'), hasStructureGuard],
//         loadComponent: () => import('./features/properties/pages/property-detail/property-detail').then(m => m.PropertyDetail),
//       },
//       {
//         path: 'property-unit-detail',
//         // canActivate: [roleGuard('owner', 'employee'), hasStructureGuard],
//         loadComponent: () => import('./features/properties/pages/location-unit/location-unit').then(m => m.LocationUnit),
//       },

//       // Dashboard (commun selon rôle)
//     //   {
//     //     path: 'dashboard',
//     //     canActivate: [authGuard],
//     //     loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
//     //   },
//     ]
//   },

//   // ── Erreurs ────────────────────────────────────────────────────────
// //   {
// //     path: '403',
// //     loadComponent: () => import('./shared/pages/forbidden/forbidden.component').then(m => m.ForbiddenComponent),
// //   },
// //   {
// //     path: '**',
// //     loadComponent: () => import('./shared/pages/not-found/not-found.component').then(m => m.NotFoundComponent),
// //   },
// ];

import { Routes } from '@angular/router';
import { authGuard, guestGuard, permissionGuard, roleGuard } from './core/auth/guards/auth-guard';

export const routes: Routes = [
  // ── Auth ─────────────────────────────────────────────────────────
  {
    path: 'auth',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./core/auth/pages/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./core/auth/pages/register/register').then((m) => m.RegisterComponent),
      },
    ],
  },

  // ── App layout ────────────────────────────────────────────────────
  {
    path: '',
    loadComponent: () => import('./layouts/app-layout/app-layout').then((m) => m.AppLayout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'properties', pathMatch: 'full' }, // ← redirection par défaut

      {
        path: 'structures',
        canActivate: [permissionGuard(['structures.index'])],
        loadComponent: () =>
          import('./features/structures/pages/structures/structures').then((m) => m.Structures),
      },
      {
        path: 'structures/:structureId',
        canActivate: [permissionGuard(['structures.show'])],
        loadComponent: () =>
          import('./features/structures/pages/structure-details/structure-details').then(
            (m) => m.StructureDetails,
          ),
      },

      {
        path: 'properties',
        canActivate: [permissionGuard(['properties.index'])],
        loadComponent: () =>
          import('./features/properties/pages/properties/properties').then((m) => m.Properties),
      },
      {
        path: 'properties/:propertyId',
        canActivate: [permissionGuard(['properties.show'])],
        loadComponent: () =>
          import('./features/properties/pages/property-detail/property-detail').then(
            (m) => m.PropertyDetail,
          ),
      },
      {
        path: 'properties/:propertyId/units/:unitId',
        canActivate: [permissionGuard(['units.show'])],
        loadComponent: () =>
          import('./features/properties/pages/location-unit/location-unit').then(
            (m) => m.LocationUnit,
          ),
      },
      {
        path: 'contrats',
        canActivate: [permissionGuard(['properties.index'])],
        loadComponent: () =>
          import('./features/properties/pages/contrats/contrats').then((m) => m.Contrats),
      },

      {
        path: 'locataires',
        canActivate: [permissionGuard(['locataires.index'])],
        loadComponent: () =>
          import('./features/locataires/pages/locataires/locataires').then((m) => m.Locataires),
      },
      {
        path: 'users',
        canActivate: [permissionGuard(['users.index'])],
        loadComponent: () => import('./features/users/pages/users').then((m) => m.Users),
      },
      {
        path: 'teams',
        canActivate: [permissionGuard(['users.index'])],
        loadComponent: () => import('./features/teams/pages/teams/teams').then((m) => m.Teams),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/pages/notifications/notifications').then(
            (m) => m.Notifications,
          ),
      },
      {
        path: 'inbox',
        redirectTo: 'notifications',
        pathMatch: 'full',
      },
      {
        path: 'faqs',
        // canActivate: [permissionGuard(['faqs.index'])],
        loadComponent: () => import('./features/faq/pages/faqs/faqs').then((m) => m.Faqs),
      },
      {
        path: 'testimonials',
        // canActivate: [permissionGuard(['testimonials.index'])],
        loadComponent: () => import('./features/testimonials/pages/testimonials/testimonials').then((m) => m.Testimonials),
      },
    ],
  },

  // ── Erreurs ────────────────────────────────────────────────────────
  {
    path: '403',
    loadComponent: () =>
      import('./shared/pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
