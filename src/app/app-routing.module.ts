import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'slides-intro', // Default page
    pathMatch: 'full'
  },
  {
    path: 'slides-intro',
    loadChildren: () => import('./slides-intro/slides-intro.module').then( m => m.SlidesIntroPageModule),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule), 
    canActivate: [NoAuthGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule), 
    canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule), 
    canActivate: [AuthGuard]
  },
  {
    path: 'spotify-button',
    loadChildren: () => import('./spotify-button/spotify-button.module').then( m => m.SpotifyButtonPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'slides-intro'
  },
  // {
  //   path: 'chats/:id',
  //   loadChildren: () => import('./chat/chat-rooms/chat-rooms-routing.module').then( m => m.ChatRoomsPageRoutingModule), 
  //   canActivate: [AuthGuard]
  // },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
