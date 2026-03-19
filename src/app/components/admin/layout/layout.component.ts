import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, BottomNavComponent],
  template: `
    <div class="admin-layout">
      <main class="admin-content">
        <router-outlet></router-outlet>
      </main>
      <app-bottom-nav></app-bottom-nav>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .admin-content {
      flex: 1;
      overflow-y: auto;
    }
  `]
})
export class AdminLayoutComponent {}
