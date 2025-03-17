import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './features/about/about.component';
import { AuthGuard } from './core/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/inventory', pathMatch: 'full' },
  { path: 'about', component: AboutComponent },
  { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
  { path: 'inventory', loadChildren: () => import('./features/inventory/inventory.module').then(m => m.InventoryModule) },
  { path: 'inventory/update/:id', loadChildren: () => import('./features/inventory/inventory.module').then(m => m.InventoryModule), canActivate: [AuthGuard] }, // Adjust if needed
  { path: 'inventory/delete/:id', loadChildren: () => import('./features/inventory/inventory.module').then(m => m.InventoryModule), canActivate: [AuthGuard] }, // Adjust if needed
  { path: '**', redirectTo: '/inventory' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }