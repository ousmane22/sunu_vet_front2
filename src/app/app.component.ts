import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SunuDialogComponent } from './shared/components/sunu-dialog/sunu-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SunuDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}


