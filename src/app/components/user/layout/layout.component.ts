import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterModule, BottomNavComponent],
  template: `
    <div class="user-layout">
      <main class="user-content">
        <router-outlet></router-outlet>
      </main>
      <app-bottom-nav></app-bottom-nav>
    </div>
  `,
  styles: [`
    .user-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .user-content {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      padding-bottom: 5rem; /* Space for the bottom navbar */
    }
  `]
})
export class UserLayoutComponent {}
